import { Router } from "express";
import { TtlCache } from "../../cache/memory.js";

const router = Router();
const cache = new TtlCache();

router.get("/:username", async (req, res) => {
  const { username } = req.params;
  const cacheKey = `runemetrics:${username}`;

  const cached = cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const data = { username };
  cache.set(cacheKey, data, 300_000);

  return res.json(data);
});

export default router;
