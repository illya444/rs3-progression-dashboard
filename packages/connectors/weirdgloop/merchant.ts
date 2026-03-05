import axios from "axios"

export async function getMerchantStock() {

  const res = await axios.get(
    "https://api.weirdgloop.org/runescape/tms/current"
  )

  return res.data
}
