import { ProgressionGraph, ProgressionNode } from "./progressionGraph"

export function buildProgressionGraph(nodes: ProgressionNode[]) {
  const graph = new ProgressionGraph()

  for (const node of nodes) {
    graph.addNode(node)
  }

  return graph
}
