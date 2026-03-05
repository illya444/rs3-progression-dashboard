import { fetchGEPrices } from "@rs3/connectors";
import { normalizeGEPrices } from "@rs3/normalizers";
import { cache } from "../src/services/cache.js";
import { config } from "../src/config/config.js";

export async function runGEWorker(): Promise<void> {
  const raw = await fetchGEPrices(config.upstream.ge);
  const normalized = normalizeGEPrices(raw);
  await cache.set("ge_prices", normalized, config.cacheTtlSeconds);
}
