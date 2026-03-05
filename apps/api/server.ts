import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchProfile, fetchQuests } from "@rs3/connectors";
import {
  buildQuestGraph,
  getCompletedQuestIds,
  getNextTargets,
  getProgressionRecommendations,
  parseQuestDataset,
  parseUnlockDataset,
  resolveQuests
} from "@rs3/core";
import { TtlCache } from "./cache.js";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());

const cache = new TtlCache();

const PROFILE_TTL_MS = 10 * 60 * 1000;
const QUESTS_TTL_MS = 6 * 60 * 60 * 1000;
const RM_BASE = "https://apps.runescape.com/runemetrics";
const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveDataPath(fileName: string): string {
  const candidates = [
    resolve(__dirname, "../../data", fileName),
    resolve(__dirname, "../../../data", fileName)
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`Could not resolve data file "${fileName}" from ${__dirname}`);
}

const QUEST_DATASET_PATH = resolveDataPath("quests.json");
const UNLOCK_DATASET_PATH = resolveDataPath("unlocks.json");
const QUEST_GRAPH = buildQuestGraph(parseQuestDataset(JSON.parse(readFileSync(QUEST_DATASET_PATH, "utf8"))));
const UNLOCKS = parseUnlockDataset(
  JSON.parse(readFileSync(UNLOCK_DATASET_PATH, "utf8")),
  new Set(QUEST_GRAPH.nodesById.keys())
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/runemetrics/:username", async (req, res) => {
  try {
    const username = String(req.params.username);
    const activitiesRaw = req.query.activities ? Number(req.query.activities) : 20;
    const activities = Number.isFinite(activitiesRaw) ? activitiesRaw : 20;

    const key = `runemetrics:profile:${username}:${activities}`;
    const cached = cache.get<unknown>(key);
    if (cached) return res.json(cached);

    const snapshot = await fetchProfile(username, activities);
    cache.set(key, snapshot, PROFILE_TTL_MS);

    res.json(snapshot);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: message });
  }
});

app.get("/quests/:username", async (req, res) => {
  try {
    const username = String(req.params.username);

    const key = `runemetrics:quests:${username}`;
    const cached = cache.get<unknown>(key);
    if (cached) return res.json(cached);

    const snapshot = await fetchQuests(username);
    cache.set(key, snapshot, QUESTS_TTL_MS);

    res.json(snapshot);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: message });
  }
});

app.get("/next-targets/:username", async (req, res) => {
  try {
    const username = String(req.params.username);
    const snapshot = await fetchProfile(username, 20);
    const { priorities } = getNextTargets(snapshot);

    res.json({
      username,
      priorities,
      fetchedAtIso: snapshot.fetchedAtIso
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: message });
  }
});

app.get("/targets/:username", async (req, res) => {
  try {
    const username = String(req.params.username);
    const activities = 20;
    const profileKey = `runemetrics:profile:${username}:${activities}`;
    const questKey = `runemetrics:quests:${username}`;

    const cachedProfile = cache.get<Awaited<ReturnType<typeof fetchProfile>>>(profileKey);
    const cachedQuests = cache.get<Awaited<ReturnType<typeof fetchQuests>>>(questKey);

    const profile = cachedProfile ?? (await fetchProfile(username, activities));
    const quests = cachedQuests ?? (await fetchQuests(username));

    if (!cachedProfile) {
      cache.set(profileKey, profile, PROFILE_TTL_MS);
    }
    if (!cachedQuests) {
      cache.set(questKey, quests, QUESTS_TTL_MS);
    }

    const analysis = getProgressionRecommendations(profile, quests, QUEST_GRAPH, UNLOCKS);
    const completedQuestIds = getCompletedQuestIds(quests, QUEST_GRAPH);
    const resolved = resolveQuests(profile, QUEST_GRAPH, completedQuestIds);
    const blockedTopReasons = resolved.missingRequirements
      .flatMap((m) => {
        const skillReasons = m.missingSkills.map(
          (s) => `${m.questName}: train ${s.skill} ${s.current}->${s.required}`
        );
        const questReasons = m.missingPrereqQuestIds.map((qid) => {
          const q = QUEST_GRAPH.nodesById.get(qid);
          return `${m.questName}: complete prerequisite ${q?.name ?? qid}`;
        });
        return [...skillReasons, ...questReasons];
      })
      .slice(0, 3);

    res.json({
      username: username.toLowerCase(),
      fetchedAtIso: profile.fetchedAtIso,
      recommendations: analysis.recommendations,
      blockedTopReasons
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: message });
  }
});

app.get("/diagnostics/:username", async (req, res) => {
  try {
    const username = String(req.params.username);
    const activities = 20;
    const key = `runemetrics:profile:${username}:${activities}`;

    const cached = cache.get<Awaited<ReturnType<typeof fetchProfile>>>(key);
    const snapshot = cached ?? (await fetchProfile(username, activities));
    if (!cached) {
      cache.set(key, snapshot, PROFILE_TTL_MS);
    }

    const skillsWithWarnings = snapshot.skills
      .filter((skill) => Array.isArray(skill.warnings) && skill.warnings.length > 0)
      .map((skill) => ({
        id: skill.id,
        name: skill.name,
        warnings: skill.warnings
      }));

    res.json({
      username,
      warnings: snapshot.warnings,
      skillsWithWarnings,
      fetchedAtIso: snapshot.fetchedAtIso
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: message });
  }
});

app.get("/debug/runemetrics/profile/:username", async (req, res) => {
  try {
    const username = String(req.params.username);
    const activitiesRaw = req.query.activities ? Number(req.query.activities) : 20;
    const activities = Number.isFinite(activitiesRaw) ? activitiesRaw : 20;
    const url = `${RM_BASE}/profile/profile?user=${encodeURIComponent(username)}&activities=${activities}`;

    const upstream = await fetch(url);
    const payload = await upstream.json();

    res.setHeader("X-Debug-Endpoint", "true");
    res.status(upstream.status).json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.setHeader("X-Debug-Endpoint", "true");
    res.status(502).json({ error: message });
  }
});

app.get("/debug/runemetrics/quests/:username", async (req, res) => {
  try {
    const username = String(req.params.username);
    const url = `${RM_BASE}/profile/quests?user=${encodeURIComponent(username)}`;

    const upstream = await fetch(url);
    const payload = await upstream.json();

    res.setHeader("X-Debug-Endpoint", "true");
    res.status(upstream.status).json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.setHeader("X-Debug-Endpoint", "true");
    res.status(502).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
