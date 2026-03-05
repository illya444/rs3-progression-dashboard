import { fetchGEPrices, fetchMerchantStock, fetchVoiceOfSeren } from "@rs3/connectors";
import { normalizeGEPrices, normalizeMerchant, normalizeVoS } from "@rs3/normalizers";

export async function runIntelligenceSync(redis: { set: (key: string, value: string) => Promise<unknown> }) {
  const [rawGe, rawMerchant, rawVos] = await Promise.all([
    fetchGEPrices(),
    fetchMerchantStock(),
    fetchVoiceOfSeren()
  ]);

  const ge = normalizeGEPrices(rawGe);
  const merchant = normalizeMerchant(rawMerchant);
  const vos = normalizeVoS(rawVos);

  await redis.set("ge_prices", JSON.stringify(ge));
  await redis.set("merchant_stock", JSON.stringify(merchant));
  await redis.set("vos_rotation", JSON.stringify(vos));
}
