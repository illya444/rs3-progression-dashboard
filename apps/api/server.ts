import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fetchProfile, fetchQuests } from "@rs3/connectors";
import { getNextTargets } from "@rs3/core";
import { TtlCache } from "./cache.js";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());

const cache = new TtlCache();

const PROFILE_TTL_MS = 10 * 60 * 1000;
const QUESTS_TTL_MS = 6 * 60 * 60 * 1000;
const RM_BASE = "https://apps.runescape.com/runemetrics";

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
