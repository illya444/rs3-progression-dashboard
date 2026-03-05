import { Router } from "express";
import { fetchQuests } from "@rs3/connectors";
import { normalizeQuests } from "@rs3/normalizers";
import { validate } from "../middleware/validate.js";
import { usernameSchema } from "../schemas/username.js";

const router = Router();

router.get("/:username", validate(usernameSchema), async (req, res) => {
  const raw = await fetchQuests(req.params.username);
  const normalized = normalizeQuests(raw as { quests?: Array<{ title?: string; status?: string }> });
  res.json(normalized);
});

export default router;
