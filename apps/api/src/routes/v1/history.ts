import { Router } from "express"
import { getXpHistory } from "../../../../packages/core/xpHistory"

const router = Router()

router.get("/:username", async (req, res) => {

  const { username } = req.params

  const history = await getXpHistory(username)

  res.json(history)

})

export default router
