import axios from "axios"

export async function getGEPrice(itemId: number) {

  const res = await axios.get(
    `https://api.weirdgloop.org/exchange/history/rs/latest?id=${itemId}`
  )

  return res.data
}
