import { Router } from "express";
import { z } from "zod";
import { fetchGEPrices } from "@rs3/connectors";
import { normalizeGEPrices } from "@rs3/normalizers";
import { config } from "../config/config.js";
import { validateRequest } from "../middleware/validate.js";
import { cache } from "../services/cache.js";
import { recordFallbackResponse, recordUpstreamFailure } from "../logger.js";

const router = Router();

const geQuerySchema = z.object({
  upstreamUrl: z.string().url().optional()
});

router.get("/", validateRequest({ query: geQuerySchema }), async (req, res) => {
  const parsed = geQuerySchema.parse(req.query);
  const upstreamUrl = parsed.upstreamUrl ?? config.upstream.ge;
  const cacheKey = `v1:ge:${upstreamUrl}`;

  const cached = await cache.get<unknown[]>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const raw = await Promise.race([
      fetchGEPrices(upstreamUrl),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("GE upstream timeout")), config.upstreamTimeoutMs)
      )
    ]);
    const normalized = normalizeGEPrices(raw);
    await cache.set(cacheKey, normalized, config.cacheTtlSeconds);
    return res.json(normalized);
  } catch (error) {
    recordUpstreamFailure("ge", error);
    const fallback = await cache.get<unknown[]>(cacheKey);
    if (fallback) {
      recordFallbackResponse("ge");
      return res.json(fallback);
    }
    return res.status(502).json({ error: "GE upstream unavailable" });
  }
});

export default router;
