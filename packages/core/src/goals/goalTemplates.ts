import type { ProgressionGraph } from "../graph/graphBuilder.js";

export type GoalId =
  | "quest_cape"
  | "max_cape"
  | "completionist"
  | "trimmed_completionist";

export type GoalTemplate = {
  id: GoalId;
  name: string;
  description: string;
  getTargetNodeIds: (graph: ProgressionGraph) => string[];
};

const GOAL_TEMPLATES: Record<GoalId, GoalTemplate> = {
  quest_cape: {
    id: "quest_cape",
    name: "Quest Cape",
    description: "Complete all quest nodes.",
    getTargetNodeIds: (graph) =>
      Object.values(graph.nodes)
        .filter((node) => node.type === "quest")
        .map((node) => node.id)
        .sort()
  },
  max_cape: {
    id: "max_cape",
    name: "Max Cape",
    description: "Reach 99 milestones for all skill progression nodes.",
    getTargetNodeIds: (graph) =>
      Object.values(graph.nodes)
        .filter((node) => node.type === "skill")
        .map((node) => node.id)
        .sort()
  },
  completionist: {
    id: "completionist",
    name: "Completionist",
    description: "Complete quest, skill, and unlock nodes.",
    getTargetNodeIds: (graph) =>
      Object.values(graph.nodes)
        .filter((node) => node.type === "quest" || node.type === "skill" || node.type === "unlock")
        .map((node) => node.id)
        .sort()
  },
  trimmed_completionist: {
    id: "trimmed_completionist",
    name: "Trimmed Completionist",
    description: "Complete all nodes in the progression graph.",
    getTargetNodeIds: (graph) => Object.keys(graph.nodes).sort()
  }
};

export function getGoalTemplate(goal: GoalId): GoalTemplate {
  return GOAL_TEMPLATES[goal];
}

export const goalTemplates = GOAL_TEMPLATES;
