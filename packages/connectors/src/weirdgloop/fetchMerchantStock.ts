import axios from "axios";

const MERCHANT_URL = "https://api.weirdgloop.org/merchant";

export async function fetchMerchantStock(): Promise<unknown> {
  const response = await axios.get(MERCHANT_URL, { timeout: 15000 });
  return response.data;
}
