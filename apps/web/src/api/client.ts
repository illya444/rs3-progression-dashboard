export type PlayerSkill = {
  id: number;
  name: string;
  level: number;
  xp: number;
};

export type PlayerSnapshot = {
  username: string;
  totalLevel?: number;
  totalskill?: number;
  totalXp?: number;
  totalxp?: number;
  combatLevel?: number;
  combatlevel?: number;
  skills?: PlayerSkill[];
};

export type QuestItem = {
  title: string;
  status: string;
};

export type RecommendationsResponse = {
  priorities?: string[];
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchPlayerSnapshot(username: string): Promise<PlayerSnapshot> {
  return fetchJson<PlayerSnapshot>(`/api/v1/profile?username=${encodeURIComponent(username)}`);
}

export function fetchQuestProgress(username: string): Promise<QuestItem[]> {
  return fetchJson<QuestItem[]>(`/api/v1/quests?username=${encodeURIComponent(username)}`);
}

export function fetchRecommendations(username: string): Promise<RecommendationsResponse> {
  return fetchJson<RecommendationsResponse>(`/api/v1/recommendations?username=${encodeURIComponent(username)}`);
}
