import axios from "axios";

const VOS_URL = "https://api.weirdgloop.org/vos";

export async function fetchVoiceOfSeren(): Promise<unknown> {
  const response = await axios.get(VOS_URL, { timeout: 15000 });
  return response.data;
}
