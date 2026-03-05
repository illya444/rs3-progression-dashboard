import axios from "axios";
import { normalizeProfile, normalizeQuests } from "./normalize.js";
import type { RuneMetricsProfileResponse, RuneMetricsQuestsResponse } from "./types.js";
import type { PlayerSnapshot, QuestSnapshot } from "@rs3/core";

const RM_BASE = "https://apps.runescape.com/runemetrics";

function assertOk<T>(data: unknown, label: string): asserts data is T {
  if (!data || typeof data !== "object") {
    throw new Error(`RuneMetrics ${label} returned an unexpected response shape`);
  }
}

export async function fetchProfile(username: string, activities = 20): Promise<PlayerSnapshot> {
  const url = `${RM_BASE}/profile/profile?user=${encodeURIComponent(username)}&activities=${activities}`;
  const res = await axios.get(url, { timeout: 15000 });
  assertOk<RuneMetricsProfileResponse>(res.data, "profile");
  return normalizeProfile(username, res.data as RuneMetricsProfileResponse);
}

export async function fetchQuests(username: string): Promise<QuestSnapshot> {
  const url = `${RM_BASE}/profile/quests?user=${encodeURIComponent(username)}`;
  const res = await axios.get(url, { timeout: 15000 });
  assertOk<RuneMetricsQuestsResponse>(res.data, "quests");
  return normalizeQuests(username, res.data as RuneMetricsQuestsResponse);
}
