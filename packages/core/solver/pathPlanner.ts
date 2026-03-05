import { optimizePath } from "./pathOptimizer"
import { progressionGraph } from "@rs3/core"

export function buildGoalPath(goal: string, graph: any = progressionGraph) {

  return optimizePath(goal, graph)

}
