import type { QuestDefinition } from "./questDataset.js";

export type QuestNode = {
  name: string;
  skillRequirements: Record<string, number>;
  questRequirements: string[];
};

export type QuestGraph = {
  nodesByName: Map<string, QuestNode>;
};

export function buildQuestGraph(quests: QuestDefinition[]): QuestGraph {
  const nodesByName = new Map<string, QuestNode>();

  for (const quest of quests) {
    nodesByName.set(quest.name, {
      name: quest.name,
      skillRequirements: { ...(quest.requirements.skills ?? {}) },
      questRequirements: [...(quest.requirements.quests ?? [])]
    });
  }

  return { nodesByName };
}
