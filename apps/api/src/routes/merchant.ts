import { Router } from "express";
import { z } from "zod";
import { fetchMerchantStock } from "@rs3/connectors";
import { normalizeMerchant } from "@rs3/normalizers";
import { config } from "../config/config.js";
import { validateRequest } from "../middleware/validate.js";
import { cache } from "../services/cache.js";

const router = Router();

const merchantQuerySchema = z.object({
  upstreamUrl: z.string().url().optional()
});

router.get("/", validateRequest({ query: merchantQuerySchema }), async (req, res) => {
  const parsed = merchantQuerySchema.parse(req.query);
  const upstreamUrl = parsed.upstreamUrl ?? config.upstream.merchant;
  const cacheKey = `v1:merchant:${upstreamUrl}`;

  const cached = await cache.get<{ items: unknown[] }>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const raw = await fetchMerchantStock(upstreamUrl);
  const normalized = normalizeMerchant(raw);
  await cache.set(cacheKey, normalized, config.cacheTtlSeconds);

  return res.json(normalized);
});

export default router;
