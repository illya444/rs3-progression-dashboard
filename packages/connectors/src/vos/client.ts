import axios from "axios";

export async function fetchVoS(upstreamUrl: string): Promise<unknown> {
  const response = await axios.get(upstreamUrl, { timeout: 15000 });
  return response.data;
}
