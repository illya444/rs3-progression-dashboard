import { Router } from "express"

const router = Router()

router.get("/", async (_req, res) => {
  res.json({ source: "vos" })
})

export default router
