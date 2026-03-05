import { Router } from "express";
import { z } from "zod";
import { fetchProfile } from "@rs3/connectors";
import { normalizeProfile } from "@rs3/normalizers";
import { prisma } from "@rs3/db";
import { validateRequest } from "../middleware/validate.js";
import { config } from "../config/config.js";
import { logger, recordUpstreamFailure } from "../logger.js";

const router = Router();

const snapshotParamsSchema = z.object({
  username: z.string().min(1)
});

router.post(
  "/:username",
  validateRequest({ params: snapshotParamsSchema }),
  async (req, res) => {
    const { username } = snapshotParamsSchema.parse(req.params);
    try {
      const rawProfile = await Promise.race([
        fetchProfile(username),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Snapshot upstream timeout")), config.upstreamTimeoutMs)
        )
      ]);
      const normalizedProfile = normalizeProfile(rawProfile as Record<string, unknown>);

      const player = await prisma.player.upsert({
        where: { username },
        update: {},
        create: { username }
      });

      const snapshot = await prisma.snapshot.create({
        data: {
          playerId: player.id,
          payload: normalizedProfile
        }
      });

      return res.status(201).json({
        id: snapshot.id,
        playerId: snapshot.playerId,
        capturedAt: snapshot.capturedAt
      });
    } catch (error) {
      recordUpstreamFailure("snapshots", error);
      logger.error(
        { username, error: error instanceof Error ? { name: error.name, message: error.message } : error },
        "snapshot_ingestion_failed"
      );
      return res.status(503).json({ error: "Snapshot ingestion failed" });
    }
  }
);

export default router;
