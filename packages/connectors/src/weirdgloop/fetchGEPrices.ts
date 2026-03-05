import axios from "axios";

const GE_EXCHANGE_URL = "https://api.weirdgloop.org/exchange";

export async function fetchGEPrices(): Promise<unknown> {
  const response = await axios.get(GE_EXCHANGE_URL, { timeout: 15000 });
  return response.data;
}
