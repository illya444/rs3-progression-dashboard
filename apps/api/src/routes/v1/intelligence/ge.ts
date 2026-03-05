import { Router } from "express"

const router = Router()

router.get("/", async (req, res) => {

  const data = await req.redis.get("ge_prices")

  res.json(JSON.parse(data))

})

export default router
