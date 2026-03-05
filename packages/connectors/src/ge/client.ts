import axios from "axios";

export async function fetchGEPrices(upstreamUrl: string): Promise<unknown> {
  const response = await axios.get(upstreamUrl, { timeout: 15000 });
  return response.data;
}
