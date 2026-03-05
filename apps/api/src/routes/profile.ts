import { Router } from "express";
import { fetchProfile } from "@rs3/connectors";
import { normalizeProfile } from "@rs3/normalizers";
import { validate } from "../middleware/validate.js";
import { usernameSchema } from "../schemas/username.js";
import { cache } from "../services/cache.js";
import { config } from "../config/config.js";
import { recordFallbackResponse, recordUpstreamFailure } from "../logger.js";

const router = Router();

router.get("/:username", validate(usernameSchema), async (req, res) => {
  const cacheKey = `v1:profile:${req.params.username}`;
  const cached = await cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const raw = await Promise.race([
      fetchProfile(req.params.username),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Profile upstream timeout")), config.upstreamTimeoutMs)
      )
    ]);
    const normalized = normalizeProfile(raw as Record<string, unknown>);
    await cache.set(cacheKey, normalized, config.cacheTtlSeconds);
    return res.json(normalized);
  } catch (error) {
    recordUpstreamFailure("profile", error);
    const fallback = await cache.get<Record<string, unknown>>(cacheKey);
    if (fallback) {
      recordFallbackResponse("profile");
      return res.json(fallback);
    }
    return res.status(502).json({ error: "Profile upstream unavailable" });
  }
});

export default router;
