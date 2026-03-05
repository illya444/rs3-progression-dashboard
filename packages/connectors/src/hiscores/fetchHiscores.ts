import axios from "axios";

const HISCORES_URL = "https://secure.runescape.com/m=hiscore/index_lite.ws";

export async function fetchHiscores(username: string): Promise<string> {
  const response = await axios.get(HISCORES_URL, {
    params: { player: username },
    timeout: 15000,
    responseType: "text"
  });

  return response.data as string;
}
