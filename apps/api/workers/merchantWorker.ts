import { fetchMerchantStock } from "@rs3/connectors";
import { normalizeMerchant } from "@rs3/normalizers";
import { cache } from "../src/services/cache.js";
import { config } from "../src/config/config.js";

export async function runMerchantWorker(): Promise<void> {
  const raw = await fetchMerchantStock(config.upstream.merchant);
  const normalized = normalizeMerchant(raw);
  await cache.set("merchant_stock", normalized, config.cacheTtlSeconds);
}
