import { Router } from "express"
import quests from "./quests"
import runemetrics from "./runemetrics"
import ge from "./intelligence/ge"
import merchant from "./intelligence/merchant"
import vos from "./intelligence/vos"
import history from "./history"
import goalPath from "./goalPath"

const router = Router()

router.use("/quests", quests)
router.use("/runemetrics", runemetrics)
router.use("/ge", ge)
router.use("/vos", vos)
router.use("/merchant", merchant)
router.use("/history", history)
router.use("/goal", goalPath)

export default router
