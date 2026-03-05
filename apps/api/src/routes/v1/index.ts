import { Router } from "express"
import quests from "./quests"
import runemetrics from "./runemetrics"
import ge from "./ge"
import vos from "./vos"
import merchant from "./merchant"
import history from "./history"

const router = Router()

router.use("/quests", quests)
router.use("/runemetrics", runemetrics)
router.use("/ge", ge)
router.use("/vos", vos)
router.use("/merchant", merchant)
router.use("/history", history)

export default router
