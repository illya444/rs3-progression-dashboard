import { progressionGraph } from "@rs3/core"

export interface GoalTemplate {
  id: string
  name: string
  targets: string[]
}

export function planGoal(goal: GoalTemplate, graph: any = progressionGraph) {

  const steps: string[] = []

  for (const node of goal.targets) {
    const deps = graph.getDependencies(node)
    steps.push(...deps)
    steps.push(node)
  }

  return [...new Set(steps)]
}
