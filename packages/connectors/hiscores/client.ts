import axios from "axios"

export async function fetchHiscores(username: string) {

  const url =
    "https://secure.runescape.com/m=hiscore/index_lite.ws"

  const response = await axios.get(url, {
    params: { player: username }
  })

  return response.data

}
