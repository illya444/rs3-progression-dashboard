import type { QuestDatasetEntry } from "./questDataset.js";

export type QuestNode = {
  id: string;
  name: string;
  prereqQuestIds: string[];
  skillReqs: Record<string, number>;
  unlockTags: string[];
  notes?: string;
};

export type PlayerSkills = Record<string, number>;

export type BlockedReason = {
  missingSkills: Array<{ skill: string; current: number; required: number }>;
  missingPrereqQuestIds: string[];
};

export type QuestGraph = {
  nodesById: Map<string, QuestNode>;
  idByName: Map<string, string>;
  depthById: Map<string, number>;
  getBlockedReasons: (
    questId: string,
    playerSkills: PlayerSkills,
    completedQuestIds: Set<string>
  ) => BlockedReason;
  topoSortSubgraph: (targetQuestId: string) => string[];
};

function getSkillLevel(playerSkills: PlayerSkills, skill: string): number {
  const value = playerSkills[skill.toLowerCase()];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function computeDepth(
  questId: string,
  nodesById: Map<string, QuestNode>,
  depthById: Map<string, number>,
  stack: Set<string>
): number {
  const cached = depthById.get(questId);
  if (cached !== undefined) return cached;
  if (stack.has(questId)) {
    throw new Error(`Quest graph cycle detected at "${questId}"`);
  }

  const quest = nodesById.get(questId);
  if (!quest) {
    throw new Error(`Quest graph missing quest "${questId}" while computing depth`);
  }

  stack.add(questId);
  let depth = 0;
  for (const prereqId of quest.prereqQuestIds) {
    const prereqDepth = computeDepth(prereqId, nodesById, depthById, stack) + 1;
    if (prereqDepth > depth) depth = prereqDepth;
  }
  stack.delete(questId);
  depthById.set(questId, depth);
  return depth;
}

export function buildQuestGraph(quests: QuestDatasetEntry[]): QuestGraph {
  const nodesById = new Map<string, QuestNode>();
  const idByName = new Map<string, string>();

  for (const quest of quests) {
    nodesById.set(quest.id, {
      id: quest.id,
      name: quest.name,
      prereqQuestIds: [...quest.prereqQuests],
      skillReqs: { ...quest.skillReqs },
      unlockTags: [...quest.unlockTags],
      notes: quest.notes
    });
    idByName.set(quest.name, quest.id);
  }

  const depthById = new Map<string, number>();
  for (const questId of nodesById.keys()) {
    computeDepth(questId, nodesById, depthById, new Set<string>());
  }

  const getBlockedReasons = (
    questId: string,
    playerSkills: PlayerSkills,
    completedQuestIds: Set<string>
  ): BlockedReason => {
    const quest = nodesById.get(questId);
    if (!quest) {
      throw new Error(`Unknown quest id "${questId}"`);
    }

    const missingSkills = Object.entries(quest.skillReqs)
      .map(([skill, required]) => {
        const current = getSkillLevel(playerSkills, skill);
        return { skill, current, required };
      })
      .filter((gap) => gap.current < gap.required);

    const missingPrereqQuestIds = quest.prereqQuestIds.filter((id) => !completedQuestIds.has(id));

    return { missingSkills, missingPrereqQuestIds };
  };

  const topoSortSubgraph = (targetQuestId: string): string[] => {
    if (!nodesById.has(targetQuestId)) {
      throw new Error(`Unknown quest id "${targetQuestId}"`);
    }

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const ordered: string[] = [];

    const visit = (questId: string): void => {
      if (visited.has(questId)) return;
      if (visiting.has(questId)) {
        throw new Error(`Quest graph cycle detected in subgraph at "${questId}"`);
      }

      visiting.add(questId);
      const quest = nodesById.get(questId);
      if (!quest) throw new Error(`Unknown quest id "${questId}"`);
      for (const prereqId of quest.prereqQuestIds) {
        visit(prereqId);
      }
      visiting.delete(questId);
      visited.add(questId);
      ordered.push(questId);
    };

    visit(targetQuestId);
    return ordered;
  };

  return { nodesById, idByName, depthById, getBlockedReasons, topoSortSubgraph };
}
