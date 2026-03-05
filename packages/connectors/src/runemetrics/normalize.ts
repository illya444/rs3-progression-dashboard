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
  let warnedSkills = 0;

  const skills: SkillSnapshot[] = (raw.skillvalues ?? []).map((sv) => {
    const skillName = SKILL_NAMES_BY_ID[sv.id] ?? `Skill-${sv.id}`;
    const rawXp = sv.xp;
    let xp = Number.isFinite(rawXp) ? rawXp : 0;
    const warnings: string[] = [];

    if (!Number.isFinite(rawXp) || rawXp < 0) {
      xp = 0;
      warnings.push(`RuneMetrics XP out of bounds for id=${sv.id} (${skillName}): ${rawXp}; clamped to 0`);
    } else if (rawXp > 200_000_000) {
      xp = 200_000_000;
      warnings.push(
        `RuneMetrics XP out of bounds for id=${sv.id} (${skillName}): ${rawXp}; clamped to 200000000`
      );
    }

    if (warnings.length > 0) warnedSkills += 1;

    return {
      id: sv.id,
      name: skillName,
      level: sv.level,
      xp,
      rank: sv.rank,
      rawXp,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  });

  skills.sort((a, b) => a.id - b.id);

  return {
    username,
    totalskill: raw.totalskill,
    totalxp: raw.totalxp,
    combatlevel: raw.combatlevel,
    skills,
    fetchedAtIso,
    warnings:
      warnedSkills > 0
        ? [`RuneMetrics returned out-of-bounds XP for ${warnedSkills} skills; values were clamped`]
        : undefined
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
