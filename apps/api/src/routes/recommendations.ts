import { Router } from "express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetchProfile, fetchQuests } from "@rs3/connectors";
import { normalizeProfile, normalizeQuests } from "@rs3/normalizers";
import { getIntelligenceTargets } from "@rs3/core";
import { validate } from "../middleware/validate.js";
import { usernameSchema } from "../schemas/username.js";

type UnlockRow = { id: string; name: string };

const router = Router();

function loadUnlocks(): UnlockRow[] {
  const file = resolve(process.cwd(), "data", "unlocks.json");
  const raw = JSON.parse(readFileSync(file, "utf8")) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map((u) => ({
    id: String((u as { id?: unknown }).id ?? ""),
    name: String((u as { name?: unknown }).name ?? "")
  }));
}

router.get("/:username", validate(usernameSchema), async (req, res) => {
  const [rawProfile, rawQuests] = await Promise.all([
    fetchProfile(req.params.username),
    fetchQuests(req.params.username)
  ]);

  const profile = normalizeProfile(rawProfile as Record<string, unknown>);
  const quests = normalizeQuests(rawQuests as { quests?: Array<{ title?: string; status?: string }> });
  const recommendations = getIntelligenceTargets({ profile, quests, unlocks: loadUnlocks() });

  res.json(recommendations);
});

export default router;
