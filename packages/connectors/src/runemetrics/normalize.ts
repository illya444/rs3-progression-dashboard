import type { PlayerSnapshot, QuestSnapshot, QuestStatus, SkillSnapshot } from "@rs3/core";
import type { RuneMetricsProfileResponse, RuneMetricsQuestsResponse } from "./types.js";

const SKILL_NAMES_BY_ID: Record<number, string> = {
  0: "Attack",
  1: "Defence",
  2: "Strength",
  3: "Constitution",
  4: "Ranged",
  5: "Prayer",
  6: "Magic",
  7: "Cooking",
  8: "Woodcutting",
  9: "Fletching",
  10: "Fishing",
  11: "Firemaking",
  12: "Crafting",
  13: "Smithing",
  14: "Mining",
  15: "Herblore",
  16: "Agility",
  17: "Thieving",
  18: "Slayer",
  19: "Farming",
  20: "Runecrafting",
  21: "Hunter",
  22: "Construction",
  23: "Summoning",
  24: "Dungeoneering",
  25: "Divination",
  26: "Invention",
  27: "Archaeology",
  28: "Necromancy"
};

function toQuestStatus(raw: string): QuestStatus {
  const s = raw?.toLowerCase?.() ?? "";
  if (s.includes("complete")) return "COMPLETED";
  if (s.includes("started") || s.includes("in progress")) return "STARTED";
  if (s.includes("not started") || s.includes("unstarted")) return "NOT_STARTED";
  return "UNKNOWN";
}

export function normalizeProfile(username: string, raw: RuneMetricsProfileResponse): PlayerSnapshot {
  const fetchedAtIso = new Date().toISOString();

  const skills: SkillSnapshot[] = (raw.skillvalues ?? []).map((sv) => {
    const mappedXp = sv.rank;
    const mappedRank = sv.xp;

    if (mappedXp > 200_000_000) {
      throw new Error(
        `RuneMetrics skill XP sanity check failed for id=${sv.id}: ${JSON.stringify(sv)}`
      );
    }

    return {
      id: sv.id,
      name: SKILL_NAMES_BY_ID[sv.id] ?? `Skill-${sv.id}`,
      level: sv.level,
      xp: mappedXp,
      rank: mappedRank
    };
  });

  return {
    username,
    totalskill: raw.totalskill,
    totalxp: raw.totalxp,
    combatlevel: raw.combatlevel,
    skills,
    fetchedAtIso
  };
}

export function normalizeQuests(username: string, raw: RuneMetricsQuestsResponse): QuestSnapshot {
  const fetchedAtIso = new Date().toISOString();

  return {
    username,
    quests: (raw.quests ?? []).map((q) => ({
      title: q.title,
      status: toQuestStatus(q.status),
      difficulty: q.difficulty,
      questPoints: q.questPoints,
      members: q.members,
      userEligible: q.userEligible
    })),
    fetchedAtIso
  };
}
