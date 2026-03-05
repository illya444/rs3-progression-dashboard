import cors from "cors";
import express from "express";
import geRoutes from "./routes/ge.js";
import merchantRoutes from "./routes/merchant.js";
import profileRoutes from "./routes/profile.js";
import questsRoutes from "./routes/quests.js";
import recommendationsRoutes from "./routes/recommendations.js";
import snapshotsRoutes from "./routes/snapshots.js";
import vosRoutes from "./routes/vos.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { getMetricsSnapshot, httpLogger, logger, recordRequest } from "./logger.js";

const app = express();

app.use(httpLogger);
app.use(cors());
app.use(express.json());
app.use(apiLimiter);
app.use((req, res, next) => {
  res.on("finish", () => {
    recordRequest(req.path, res.statusCode);
  });
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime())
  });
});

app.get("/metrics", (_req, res) => {
  res.json(getMetricsSnapshot());
});

app.use("/v1/profile", profileRoutes);
app.use("/v1/quests", questsRoutes);
app.use("/v1/recommendations", recommendationsRoutes);
app.use("/v1/ge", geRoutes);
app.use("/v1/merchant", merchantRoutes);
app.use("/v1/snapshots", snapshotsRoutes);
app.use("/v1/vos", vosRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/quests", questsRoutes);
app.use("/api/v1/recommendations", recommendationsRoutes);
app.use("/api/v1/ge", geRoutes);
app.use("/api/v1/merchant", merchantRoutes);
app.use("/api/v1/snapshots", snapshotsRoutes);
app.use("/api/v1/vos", vosRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(
    { error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err },
    "unhandled_api_error"
  );
  res.status(500).json({ error: "Internal server error" });
});

export default app;
