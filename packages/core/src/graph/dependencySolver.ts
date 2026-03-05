import type { ProgressionGraph } from "./graphBuilder.js";

function collectMissing(
  graph: ProgressionGraph,
  nodeId: string,
  completed: Set<string>,
  visiting: Set<string>,
  missing: Set<string>
): void {
  if (visiting.has(nodeId)) return;
  visiting.add(nodeId);

  const node = graph.nodes[nodeId];
  if (!node) {
    missing.add(nodeId);
    visiting.delete(nodeId);
    return;
  }

  for (const requirementId of node.requirements) {
    if (!completed.has(requirementId)) {
      missing.add(requirementId);
      collectMissing(graph, requirementId, completed, visiting, missing);
    }
  }

  visiting.delete(nodeId);
}

export function getMissingRequirements(
  graph: ProgressionGraph,
  completedNodeIds: Iterable<string>,
  targetNodeId: string
): string[] {
  const completed = new Set(completedNodeIds);
  const missing = new Set<string>();
  collectMissing(graph, targetNodeId, completed, new Set<string>(), missing);
  return Array.from(missing).sort();
}

export function isBlockedNode(
  graph: ProgressionGraph,
  completedNodeIds: Iterable<string>,
  nodeId: string
): boolean {
  return getMissingRequirements(graph, completedNodeIds, nodeId).length > 0;
}

export function getBlockedNodes(
  graph: ProgressionGraph,
  completedNodeIds: Iterable<string>
): string[] {
  const completed = new Set(completedNodeIds);
  return Object.keys(graph.nodes)
    .filter((nodeId) => !completed.has(nodeId))
    .filter((nodeId) => isBlockedNode(graph, completed, nodeId))
    .sort();
}
