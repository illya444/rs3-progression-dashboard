export type QuestDatasetEntry = {
  id: string;
  name: string;
  prereqQuests: string[];
  skillReqs: Record<string, number>;
  unlockTags: string[];
  notes?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeSkillKey(skill: string): string {
  return skill.trim().toLowerCase();
}

export function parseQuestDataset(input: unknown): QuestDatasetEntry[] {
  if (!Array.isArray(input)) {
    throw new Error("Quest dataset validation failed:\n- Dataset must be an array");
  }

  const errors: string[] = [];
  const entries: QuestDatasetEntry[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();

  for (let i = 0; i < input.length; i += 1) {
    const item = input[i];
    if (!isRecord(item)) {
      errors.push(`- [${i}] must be an object`);
      continue;
    }

    const id = item.id;
    const name = item.name;
    const prereqQuests = item.prereqQuests;
    const skillReqs = item.skillReqs;
    const unlockTags = item.unlockTags;
    const notes = item.notes;

    if (typeof id !== "string" || id.trim() === "") {
      errors.push(`- [${i}] id must be a non-empty string`);
    } else if (!/^[a-z0-9-]+$/.test(id)) {
      errors.push(`- [${i}] id must be lowercase slug format (a-z0-9-)`);
    }

    if (typeof name !== "string" || name.trim() === "") {
      errors.push(`- [${i}] name must be a non-empty string`);
    }

    if (!Array.isArray(prereqQuests) || prereqQuests.some((q) => typeof q !== "string")) {
      errors.push(`- [${i}] prereqQuests must be string[]`);
    }

    if (!isRecord(skillReqs)) {
      errors.push(`- [${i}] skillReqs must be record<string, number>`);
    }

    if (!Array.isArray(unlockTags) || unlockTags.some((t) => typeof t !== "string")) {
      errors.push(`- [${i}] unlockTags must be string[]`);
    }

    if (notes !== undefined && typeof notes !== "string") {
      errors.push(`- [${i}] notes must be a string when provided`);
    }

    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      !Array.isArray(prereqQuests) ||
      !isRecord(skillReqs) ||
      !Array.isArray(unlockTags)
    ) {
      continue;
    }

    if (ids.has(id)) {
      errors.push(`- Duplicate id detected: "${id}"`);
    }
    if (names.has(name)) {
      errors.push(`- Duplicate name detected: "${name}"`);
    }
    ids.add(id);
    names.add(name);

    const normalizedSkillReqs: Record<string, number> = {};
    for (const [skill, level] of Object.entries(skillReqs)) {
      if (typeof level !== "number" || !Number.isFinite(level) || level < 0) {
        errors.push(`- [${i}] skillReqs.${skill} must be a finite number >= 0`);
        continue;
      }
      normalizedSkillReqs[normalizeSkillKey(skill)] = level;
    }

    const normalizedPrereqs = prereqQuests
      .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      .map((q) => q.trim());

    const normalizedTags = unlockTags
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim().toLowerCase());

    entries.push({
      id,
      name,
      prereqQuests: normalizedPrereqs,
      skillReqs: normalizedSkillReqs,
      unlockTags: Array.from(new Set(normalizedTags)),
      notes: typeof notes === "string" ? notes : undefined
    });
  }

  const idSet = new Set(entries.map((e) => e.id));
  for (const entry of entries) {
    for (const prereqId of entry.prereqQuests) {
      if (!idSet.has(prereqId)) {
        errors.push(`- Quest "${entry.id}" references missing prereq "${prereqId}"`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Quest dataset validation failed:\n${errors.join("\n")}`);
  }

  return entries;
}
