import { Router } from "express";
import { fetchQuests } from "@rs3/connectors";
import { normalizeQuests } from "@rs3/normalizers";
import { validate } from "../middleware/validate.js";
import { usernameSchema } from "../schemas/username.js";
import { cache } from "../services/cache.js";
import { config } from "../config/config.js";
import { recordFallbackResponse, recordUpstreamFailure } from "../logger.js";

const router = Router();

router.get("/:username", validate(usernameSchema), async (req, res) => {
  const cacheKey = `v1:quests:${req.params.username}`;
  const cached = await cache.get<Array<{ title: string; status: string }>>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const raw = await Promise.race([
      fetchQuests(req.params.username),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Quests upstream timeout")), config.upstreamTimeoutMs)
      )
    ]);
    const normalized = normalizeQuests(raw as { quests?: Array<{ title?: string; status?: string }> });
    await cache.set(cacheKey, normalized, config.cacheTtlSeconds);
    return res.json(normalized);
  } catch (error) {
    recordUpstreamFailure("quests", error);
    const fallback = await cache.get<Array<{ title: string; status: string }>>(cacheKey);
    if (fallback) {
      recordFallbackResponse("quests");
      return res.json(fallback);
    }
    return res.status(502).json({ error: "Quests upstream unavailable" });
  }
});

export default router;
