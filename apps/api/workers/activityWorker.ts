import { getVoiceOfSeren } from "../../../packages/connectors/weirdgloop/vos"
import { getMerchantStock } from "../../../packages/connectors/weirdgloop/merchant"

export async function updateActivities() {

  const vos = await getVoiceOfSeren()
  const merchant = await getMerchantStock()

  console.log("Voice of Seren", vos)
  console.log("Merchant stock", merchant)

}
