import { Router } from "express"

const router = Router()

router.get("/:itemIds", async (req, res) => {
  const { itemIds } = req.params
  res.json({ itemIds, source: "ge" })
})

export default router
