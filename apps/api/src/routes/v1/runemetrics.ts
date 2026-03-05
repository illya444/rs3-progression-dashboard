import { Router } from "express"
import { validate } from "../../middleware/validate"
import { usernameSchema } from "../../schemas/username"
import { getCache, setCache } from "../../../../../packages/connectors/cache/redis"

const router = Router()

router.get(
  "/:username",
  validate(usernameSchema),
  async (req, res) => {
    const { username } = req.params

    const cacheKey = `runemetrics:${username}`

    const cached = await getCache(cacheKey)

    if (cached) {
      return res.json(cached)
    }

    const data = { username }

    await setCache(cacheKey, data, 300)

    res.json(data)
  }
)

export default router
