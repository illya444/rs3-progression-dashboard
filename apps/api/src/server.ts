import cors from "cors";
import express from "express";
import profileRoutes from "./routes/profile.js";
import questsRoutes from "./routes/quests.js";
import recommendationsRoutes from "./routes/recommendations.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/quests", questsRoutes);
app.use("/api/v1/recommendations", recommendationsRoutes);
app.use("/api/v1/runemetrics", profileRoutes);

// Compatibility aliases for existing clients.
app.use("/runemetrics", profileRoutes);
app.use("/quests", questsRoutes);
app.use("/recommendations", recommendationsRoutes);

export default app;
