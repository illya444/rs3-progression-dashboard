import { Router } from "express";
import { z } from "zod";
import { fetchProfile } from "@rs3/connectors";
import { normalizeProfile } from "@rs3/normalizers";
import { prisma } from "@rs3/db";
import { validateRequest } from "../middleware/validate.js";

const router = Router();

const snapshotParamsSchema = z.object({
  username: z.string().min(1)
});

router.post(
  "/:username",
  validateRequest({ params: snapshotParamsSchema }),
  async (req, res) => {
    const { username } = snapshotParamsSchema.parse(req.params);

    const rawProfile = await fetchProfile(username);
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
  }
);

export default router;
