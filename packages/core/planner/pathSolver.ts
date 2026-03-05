import { progressionGraph } from "@rs3/core"

export function solvePath(start: string, goal: string, graph: any = progressionGraph): string[] {
  if (start === goal) return [start]

  const deps = graph.getDependencies(goal) as string[]
  return [...deps, goal]
}
