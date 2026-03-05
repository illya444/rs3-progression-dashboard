import type { ProgressionGraph } from "./graphBuilder.js";
import { getBlockedNodes, getMissingRequirements } from "./dependencySolver.js";

export type ProgressionPlan = {
  optimalPath: string[];
  missingRequirements: Record<string, string[]>;
  blockedNodes: string[];
};

function buildDependentsIndex(graph: ProgressionGraph): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const nodeId of Object.keys(graph.nodes)) {
    scores[nodeId] = 0;
  }

  for (const edge of graph.edges) {
    if (edge.type === "dependencies" || edge.type === "unlocks") {
      scores[edge.from] = (scores[edge.from] ?? 0) + 1;
    }
  }

  return scores;
}

function getAvailableNodes(graph: ProgressionGraph, completed: Set<string>): string[] {
  return Object.values(graph.nodes)
    .filter((node) => !completed.has(node.id))
    .filter((node) => node.requirements.every((requirementId) => completed.has(requirementId)))
    .map((node) => node.id)
    .sort();
}

export function computeOptimalProgressionPath(
  graph: ProgressionGraph,
  completedNodeIds: Iterable<string>
): string[] {
  const completed = new Set(completedNodeIds);
  const scores = buildDependentsIndex(graph);
  const path: string[] = [];

  while (path.length < Object.keys(graph.nodes).length) {
    const available = getAvailableNodes(graph, completed);
    if (available.length === 0) break;

    available.sort((a, b) => {
      const scoreDiff = (scores[b] ?? 0) - (scores[a] ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return a.localeCompare(b);
    });

    const nextNodeId = available[0];
    completed.add(nextNodeId);
    path.push(nextNodeId);
  }

  return path;
}

export function planProgression(
  graph: ProgressionGraph,
  completedNodeIds: Iterable<string>,
  targetNodeIds: Iterable<string>
): ProgressionPlan {
  const targetIds = Array.from(new Set(targetNodeIds)).sort();
  const missingRequirements: Record<string, string[]> = {};

  for (const targetId of targetIds) {
    missingRequirements[targetId] = getMissingRequirements(graph, completedNodeIds, targetId);
  }

  return {
    optimalPath: computeOptimalProgressionPath(graph, completedNodeIds),
    missingRequirements,
    blockedNodes: getBlockedNodes(graph, completedNodeIds)
  };
}
