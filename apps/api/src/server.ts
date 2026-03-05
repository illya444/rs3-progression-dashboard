import express from "express"
import v1Routes from "./routes/v1"
import { apiLimiter } from "./middleware/rateLimit"

const app = express()

app.use("/api", apiLimiter)
app.use("/api/v1", v1Routes)

export default app
