import { Router } from "express"

const router = Router()

router.get("/:username", async (req, res) => {
  const { username } = req.params
  res.json({ username, source: "quests" })
})

export default router
