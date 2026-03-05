import { Router } from "express";
import { z } from "zod";
import { fetchGEPrices } from "@rs3/connectors";
import { normalizeGEPrices } from "@rs3/normalizers";
import { config } from "../config/config.js";
import { validateRequest } from "../middleware/validate.js";
import { cache } from "../services/cache.js";

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

  const raw = await fetchGEPrices(upstreamUrl);
  const normalized = normalizeGEPrices(raw);
  await cache.set(cacheKey, normalized, config.cacheTtlSeconds);

  return res.json(normalized);
});

export default router;
