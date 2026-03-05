import { Router } from "express";
import { z } from "zod";
import { fetchVoS } from "@rs3/connectors";
import { normalizeVoS } from "@rs3/normalizers";
import { config } from "../config/config.js";
import { validateRequest } from "../middleware/validate.js";
import { cache } from "../services/cache.js";

const router = Router();

const vosQuerySchema = z.object({
  upstreamUrl: z.string().url().optional()
});

router.get("/", validateRequest({ query: vosQuerySchema }), async (req, res) => {
  const parsed = vosQuerySchema.parse(req.query);
  const upstreamUrl = parsed.upstreamUrl ?? config.upstream.vos;
  const cacheKey = `v1:vos:${upstreamUrl}`;

  const cached = await cache.get<{ districts: string[] }>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const raw = await fetchVoS(upstreamUrl);
  const normalized = normalizeVoS(raw);
  await cache.set(cacheKey, normalized, config.cacheTtlSeconds);

  return res.json(normalized);
});

export default router;
