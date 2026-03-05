import axios from "axios";

const RM_QUESTS_URL = "https://apps.runescape.com/runemetrics/profile/quests";

export async function fetchQuests(username: string): Promise<unknown> {
  const response = await axios.get(RM_QUESTS_URL, {
    params: { user: username },
    timeout: 15000
  });

  return response.data;
}
