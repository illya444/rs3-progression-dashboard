import axios from "axios"

export async function getVoiceOfSeren() {

  const res = await axios.get(
    "https://api.weirdgloop.org/runescape/vos"
  )

  return res.data
}
