import { Router } from "express";
import { fetchProfile } from "@rs3/connectors";
import { normalizeProfile } from "@rs3/normalizers";
import { validate } from "../middleware/validate.js";
import { usernameSchema } from "../schemas/username.js";

const router = Router();

router.get("/:username", validate(usernameSchema), async (req, res) => {
  const raw = await fetchProfile(req.params.username);
  const normalized = normalizeProfile(raw as Record<string, unknown>);
  res.json(normalized);
});

export default router;
