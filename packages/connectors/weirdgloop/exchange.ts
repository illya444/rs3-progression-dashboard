import axios from "axios"

export async function fetchGEPrices() {

  const response = await axios.get(
    "https://api.weirdgloop.org/exchange"
  )

  return response.data

}
