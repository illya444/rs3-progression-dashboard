export function resolveDependencies(nodeId: string, graph: any): string[] {

  const visited = new Set<string>()
  const stack: string[] = []

  function dfs(id: string) {
    if (visited.has(id)) return
    visited.add(id)

    const deps = graph.getDependencies(id)

    for (const dep of deps) {
      dfs(dep)
    }

    stack.push(id)
  }

  dfs(nodeId)

  return stack
}
