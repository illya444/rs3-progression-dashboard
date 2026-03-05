import { Router } from "express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetchProfile, fetchQuests } from "@rs3/connectors";
import { normalizeProfile, normalizeQuests } from "@rs3/normalizers";
import { getIntelligenceTargets } from "@rs3/core";
import { validate } from "../middleware/validate.js";
import { usernameSchema } from "../schemas/username.js";
import { cache } from "../services/cache.js";
import { config } from "../config/config.js";
import { recordFallbackResponse, recordUpstreamFailure } from "../logger.js";

type UnlockRow = { id: string; name: string };

const router = Router();

function loadUnlocks(): UnlockRow[] {
  const file = resolve(process.cwd(), "data", "unlocks.json");
  const raw = JSON.parse(readFileSync(file, "utf8")) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map((u) => ({
    id: String((u as { id?: unknown }).id ?? ""),
    name: String((u as { name?: unknown }).name ?? "")
  }));
}

router.get("/:username", validate(usernameSchema), async (req, res) => {
  const cacheKey = `v1:recommendations:${req.params.username}`;
  const cached = await cache.get<{ priorities: string[] }>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const [rawProfile, rawQuests] = await Promise.all([
      Promise.race([
        fetchProfile(req.params.username),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Recommendations profile timeout")), config.upstreamTimeoutMs)
        )
      ]),
      Promise.race([
        fetchQuests(req.params.username),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Recommendations quests timeout")), config.upstreamTimeoutMs)
        )
      ])
    ]);

    const profile = normalizeProfile(rawProfile as Record<string, unknown>);
    const quests = normalizeQuests(rawQuests as { quests?: Array<{ title?: string; status?: string }> });
    const recommendations = getIntelligenceTargets({ profile, quests, unlocks: loadUnlocks() });
    await cache.set(cacheKey, recommendations, config.cacheTtlSeconds);

    return res.json(recommendations);
  } catch (error) {
    recordUpstreamFailure("recommendations", error);
    const fallback = await cache.get<{ priorities: string[] }>(cacheKey);
    if (fallback) {
      recordFallbackResponse("recommendations");
      return res.json(fallback);
    }
    return res.status(502).json({ error: "Recommendations upstream unavailable" });
  }
});

export default router;
