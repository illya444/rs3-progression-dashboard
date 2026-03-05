import cors from "cors";
import express from "express";
import geRoutes from "./routes/ge.js";
import merchantRoutes from "./routes/merchant.js";
import vosRoutes from "./routes/vos.js";
import { apiLimiter } from "./middleware/rateLimit.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/v1/ge", geRoutes);
app.use("/v1/merchant", merchantRoutes);
app.use("/v1/vos", vosRoutes);
app.use("/api/v1/ge", geRoutes);
app.use("/api/v1/merchant", merchantRoutes);
app.use("/api/v1/vos", vosRoutes);

export default app;
