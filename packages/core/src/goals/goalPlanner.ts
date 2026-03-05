import type { PlayerSnapshot } from "../models/player.js";
import { buildProgressionGraphFromData, type GraphNodeType, type ProgressionGraph } from "../graph/graphBuilder.js";
import { getMissingRequirements, isBlockedNode } from "../graph/dependencySolver.js";
import { planProgression } from "../graph/pathPlanner.js";
import { getGoalTemplate, type GoalId } from "./goalTemplates.js";

type ExtendedSnapshot = PlayerSnapshot & {
  completedQuests?: string[];
  completedUnlocks?: string[];
  completedActivities?: string[];
};

export type GoalTask = {
  id: string;
  type: GraphNodeType;
  blocked: boolean;
  missingRequirements: string[];
};

export type GoalPlan = {
  goal: GoalId;
  requiredTasks: GoalTask[];
  recommendedProgressionOrder: string[];
  blockedNodes: string[];
};

function normalizeId(input: string): string {
  return input.toLowerCase().replace(/\s+/g, "_");
}

function deriveCompletedNodes(snapshot: ExtendedSnapshot, graph: ProgressionGraph): Set<string> {
  const completed = new Set<string>();

  for (const skill of snapshot.skills) {
    const skillKey = normalizeId(skill.name);
    const by99Id = `${skillKey}_99`;
    if (skill.level >= 99 && graph.nodes[by99Id]) {
      completed.add(by99Id);
    }

    for (const node of Object.values(graph.nodes)) {
      if (node.type !== "skill") continue;
      if (node.id === skillKey && skill.level >= 1) {
        completed.add(node.id);
      }
    }
  }

  for (const questId of snapshot.completedQuests ?? []) {
    if (graph.nodes[questId]) completed.add(questId);
  }

  for (const unlockId of snapshot.completedUnlocks ?? []) {
    if (graph.nodes[unlockId]) completed.add(unlockId);
  }

  for (const activityId of snapshot.completedActivities ?? []) {
    if (graph.nodes[activityId]) completed.add(activityId);
  }

  return completed;
}

export function generateGoalPlan(playerSnapshot: ExtendedSnapshot, goal: GoalId): GoalPlan {
  const graph = buildProgressionGraphFromData();
  const template = getGoalTemplate(goal);
  const targetNodeIds = template.getTargetNodeIds(graph);
  const completed = deriveCompletedNodes(playerSnapshot, graph);

  const requiredTaskIds = new Set<string>();
  for (const targetNodeId of targetNodeIds) {
    if (!completed.has(targetNodeId)) {
      requiredTaskIds.add(targetNodeId);
    }
    for (const requirementId of getMissingRequirements(graph, completed, targetNodeId)) {
      if (!completed.has(requirementId)) {
        requiredTaskIds.add(requirementId);
      }
    }
  }

  const requiredTasks: GoalTask[] = Array.from(requiredTaskIds)
    .map((taskId) => {
      const node = graph.nodes[taskId];
      return {
        id: taskId,
        type: node?.type ?? "activity",
        blocked: isBlockedNode(graph, completed, taskId),
        missingRequirements: getMissingRequirements(graph, completed, taskId)
      };
    })
    .sort((a, b) => {
      if (a.blocked !== b.blocked) return Number(a.blocked) - Number(b.blocked);
      if (a.missingRequirements.length !== b.missingRequirements.length) {
        return a.missingRequirements.length - b.missingRequirements.length;
      }
      return a.id.localeCompare(b.id);
    });

  const progression = planProgression(graph, completed, requiredTaskIds);
  const recommendedProgressionOrder = progression.optimalPath.filter((nodeId) => requiredTaskIds.has(nodeId));

  return {
    goal: template.id,
    requiredTasks,
    recommendedProgressionOrder,
    blockedNodes: progression.blockedNodes.filter((nodeId) => requiredTaskIds.has(nodeId))
  };
}
