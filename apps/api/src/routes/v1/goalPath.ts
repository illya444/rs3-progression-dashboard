import { Router } from "express"
import { buildGoalPath } from "../../../../packages/core/solver/pathPlanner"
import { GOALS } from "../../../../packages/core/rules/goals"

const router = Router()

router.get("/:goal", async (req, res) => {

  const goalId = req.params.goal

  const goal = GOALS[goalId]

  if (!goal) {
    return res.status(404).json({ error: "Unknown goal" })
  }

  const path = buildGoalPath(goal.target, global.progressionGraph)

  res.json({
    goal: goal.name,
    steps: path
  })

})

export default router
