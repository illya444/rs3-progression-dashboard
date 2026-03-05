import axios from "axios"

export async function fetchMerchantStock() {

  const response = await axios.get(
    "https://api.weirdgloop.org/merchant"
  )

  return response.data

}
