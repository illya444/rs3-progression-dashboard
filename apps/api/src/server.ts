import express from "express"
import v1Routes from "./routes/v1"
import { apiLimiter } from "./middleware/rateLimit"
import { progressionGraph } from "../../../packages/core"

declare global {
  var progressionGraph: unknown
}

const app = express()

global.progressionGraph = progressionGraph

app.use("/api", apiLimiter)
app.use("/api/v1", v1Routes)

export default app
