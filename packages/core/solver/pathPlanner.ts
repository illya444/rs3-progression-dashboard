import { optimizePath } from "./pathOptimizer"

export function buildGoalPath(goal: string, graph: any) {

  return optimizePath(goal, graph)

}
