import axios from "axios"

export async function fetchRuneMetricsProfile(username: string) {

  const url =
    "https://apps.runescape.com/runemetrics/profile/profile"

  const response = await axios.get(url, {
    params: { user: username }
  })

  return response.data

}
