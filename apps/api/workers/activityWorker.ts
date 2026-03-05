import { fetchMerchantStock, fetchVoiceOfSeren } from "@rs3/connectors";
import { normalizeMerchant, normalizeVoS } from "@rs3/normalizers";

export async function updateActivities() {
  const [rawVos, rawMerchant] = await Promise.all([fetchVoiceOfSeren(), fetchMerchantStock()]);
  const vos = normalizeVoS(rawVos);
  const merchant = normalizeMerchant(rawMerchant);

  console.log("Voice of Seren", vos);
  console.log("Merchant stock", merchant);
}
