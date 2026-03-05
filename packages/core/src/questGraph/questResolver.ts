import type { PlayerSnapshot } from "../models/player.js";
import type { QuestSnapshot } from "../models/quests.js";
import type { BlockedReason, PlayerSkills, QuestGraph, QuestNode } from "./questGraphBuilder.js";

export type MissingRequirement = {
  questId: string;
  questName: string;
  missingSkills: Array<{ skill: string; current: number; required: number }>;
  missingPrereqQuestIds: string[];
};

export type QuestResolution = {
  availableQuests: QuestNode[];
  blockedQuests: QuestNode[];
  missingRequirements: MissingRequirement[];
};

const UNLOCK_TAG_PRIORITY: Record<string, number> = {
  prifddinas: 1,
  curses: 2,
  sunspear: 3,
  invention: 4,
  ports: 5
};

function toPlayerSkills(player: PlayerSnapshot): PlayerSkills {
  const skills: PlayerSkills = {};
  for (const skill of player.skills) {
    skills[skill.name.toLowerCase()] = skill.level;
  }
  return skills;
}

export function getCompletedQuestIds(questSnapshot: QuestSnapshot | undefined, questGraph: QuestGraph): Set<string> {
  const completed = new Set<string>();
  for (const q of questSnapshot?.quests ?? []) {
    if (q.status !== "COMPLETED") continue;
    const id = questGraph.idByName.get(q.title);
    if (id) completed.add(id);
  }
  return completed;
}

function bestTagPriority(unlockTags: string[]): number {
  let best = Number.MAX_SAFE_INTEGER;
  for (const tag of unlockTags) {
    const p = UNLOCK_TAG_PRIORITY[tag] ?? 99;
    if (p < best) best = p;
  }
  return best;
}

function sortQuestsDeterministically(questGraph: QuestGraph, items: QuestNode[]): QuestNode[] {
  return [...items].sort((a, b) => {
    const priorityDiff = bestTagPriority(a.unlockTags) - bestTagPriority(b.unlockTags);
    if (priorityDiff !== 0) return priorityDiff;

    const depthA = questGraph.depthById.get(a.id) ?? 0;
    const depthB = questGraph.depthById.get(b.id) ?? 0;
    if (depthA !== depthB) return depthA - depthB;

    return a.name.localeCompare(b.name);
  });
}

export function resolveQuests(
  player: PlayerSnapshot,
  questGraph: QuestGraph,
  completedQuestIds: Set<string>
): QuestResolution {
  const playerSkills = toPlayerSkills(player);
  const availableQuests: QuestNode[] = [];
  const blockedQuests: QuestNode[] = [];
  const missingRequirements: MissingRequirement[] = [];

  for (const quest of questGraph.nodesById.values()) {
    if (completedQuestIds.has(quest.id)) continue;

    const reasons: BlockedReason = questGraph.getBlockedReasons(quest.id, playerSkills, completedQuestIds);
    const blocked = reasons.missingSkills.length > 0 || reasons.missingPrereqQuestIds.length > 0;

    if (!blocked) {
      availableQuests.push(quest);
      continue;
    }

    blockedQuests.push(quest);
    missingRequirements.push({
      questId: quest.id,
      questName: quest.name,
      missingSkills: reasons.missingSkills,
      missingPrereqQuestIds: reasons.missingPrereqQuestIds
    });
  }

  const sortedAvailable = sortQuestsDeterministically(questGraph, availableQuests);
  const sortedBlocked = sortQuestsDeterministically(questGraph, blockedQuests);
  const missingById = new Map(missingRequirements.map((m) => [m.questId, m]));
  const sortedMissing = sortedBlocked.map((q) => missingById.get(q.id)).filter((m): m is MissingRequirement => !!m);

  return {
    availableQuests: sortedAvailable,
    blockedQuests: sortedBlocked,
    missingRequirements: sortedMissing
  };
}
