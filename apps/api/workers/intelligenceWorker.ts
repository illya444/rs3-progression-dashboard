import { fetchGEPrices } from "../../../packages/connectors/weirdgloop/exchange"
import { fetchMerchantStock } from "../../../packages/connectors/weirdgloop/merchant"
import { fetchVoiceOfSeren } from "../../../packages/connectors/weirdgloop/vos"

export async function runIntelligenceSync(redis: any) {

  const ge = await fetchGEPrices()
  const merchant = await fetchMerchantStock()
  const vos = await fetchVoiceOfSeren()

  await redis.set("ge_prices", JSON.stringify(ge))
  await redis.set("merchant_stock", JSON.stringify(merchant))
  await redis.set("vos_rotation", JSON.stringify(vos))

}
