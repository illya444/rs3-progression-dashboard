const API_BASE = "http://localhost:3000/api/v1"

export async function fetchPlayer(username: string) {

  const res = await fetch(`${API_BASE}/runemetrics/${username}`)

  return res.json()

}

export async function fetchQuests(username: string) {

  const res = await fetch(`${API_BASE}/quests/${username}`)

  return res.json()

}

export async function fetchRecommendations(username: string) {

  const res = await fetch(`${API_BASE}/recommendations/${username}`)

  return res.json()

}
