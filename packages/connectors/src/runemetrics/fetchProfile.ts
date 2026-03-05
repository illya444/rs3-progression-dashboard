import axios from "axios";

const RM_PROFILE_URL = "https://apps.runescape.com/runemetrics/profile/profile";

export async function fetchProfile(username: string): Promise<unknown> {
  const response = await axios.get(RM_PROFILE_URL, {
    params: { user: username },
    timeout: 15000
  });

  return response.data;
}
