import type { PlayerSnapshot } from "../models/player.js";
import type { QuestSnapshot } from "../models/quests.js";
import type { QuestGraph, QuestNode } from "./questGraphBuilder.js";

export type BlockedQuest = {
  quest: QuestNode;
  missingSkills: Array<{ skill: string; current: number; required: number }>;
  missingQuests: string[];
};

const SKILL_NAME_BY_KEY: Record<string, string> = {
  agility: "Agility",
  attack: "Attack",
  construction: "Construction",
  constitution: "Constitution",
  crafting: "Crafting",
  defence: "Defence",
  divination: "Divination",
  dungeoneering: "Dungeoneering",
  farming: "Farming",
  firemaking: "Firemaking",
  fishing: "Fishing",
  fletching: "Fletching",
  herblore: "Herblore",
  hunter: "Hunter",
  invention: "Invention",
  magic: "Magic",
  mining: "Mining",
  necromancy: "Necromancy",
  prayer: "Prayer",
  ranged: "Ranged",
  runecrafting: "Runecrafting",
  slayer: "Slayer",
  smithing: "Smithing",
  strength: "Strength",
  summoning: "Summoning",
  thieving: "Thieving",
  woodcutting: "Woodcutting"
};

function getPlayerSkillLevel(player: PlayerSnapshot, skillKey: string): number {
  const targetName = SKILL_NAME_BY_KEY[skillKey] ?? skillKey;
  const skill = player.skills.find((s) => s.name.toLowerCase() === targetName.toLowerCase());
  return skill?.level ?? 0;
}

export function getCompletedQuestNames(questSnapshot?: QuestSnapshot): Set<string> {
  const completed = (questSnapshot?.quests ?? [])
    .filter((q) => q.status === "COMPLETED")
    .map((q) => q.title);
  return new Set(completed);
}

function getQuestBlockers(
  player: PlayerSnapshot,
  quest: QuestNode,
  completedQuestNames: Set<string>
): BlockedQuest {
  const missingSkills = Object.entries(quest.skillRequirements)
    .map(([skill, required]) => {
      const current = getPlayerSkillLevel(player, skill);
      return { skill, current, required };
    })
    .filter((gap) => gap.current < gap.required);

  const missingQuests = quest.questRequirements.filter((q) => !completedQuestNames.has(q));

  return { quest, missingSkills, missingQuests };
}

export function getAvailableQuests(
  player: PlayerSnapshot,
  questGraph: QuestGraph,
  completedQuestNames: Set<string>
): QuestNode[] {
  const available: QuestNode[] = [];

  for (const quest of questGraph.nodesByName.values()) {
    if (completedQuestNames.has(quest.name)) continue;

    const blockers = getQuestBlockers(player, quest, completedQuestNames);
    if (blockers.missingSkills.length === 0 && blockers.missingQuests.length === 0) {
      available.push(quest);
    }
  }

  return available.sort((a, b) => a.name.localeCompare(b.name));
}

export function getBlockedQuests(
  player: PlayerSnapshot,
  questGraph: QuestGraph,
  completedQuestNames: Set<string>
): BlockedQuest[] {
  const blocked: BlockedQuest[] = [];

  for (const quest of questGraph.nodesByName.values()) {
    if (completedQuestNames.has(quest.name)) continue;

    const blockers = getQuestBlockers(player, quest, completedQuestNames);
    if (blockers.missingSkills.length > 0 || blockers.missingQuests.length > 0) {
      blocked.push(blockers);
    }
  }

  return blocked;
}
