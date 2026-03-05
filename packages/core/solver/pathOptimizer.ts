interface SolverNode {
  id: string
  type: string
  requirements: string[]
  cost: number
}

export function optimizePath(target: string, graph: any) {

  const visited = new Set<string>()
  const result: string[] = []

  function dfs(nodeId: string) {

    if (visited.has(nodeId)) return
    visited.add(nodeId)

    const deps = graph.getDependencies(nodeId)

    for (const dep of deps) {
      dfs(dep)
    }

    result.push(nodeId)
  }

  dfs(target)

  return result
}
