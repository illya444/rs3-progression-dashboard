export type UnlockCategory = "infrastructure" | "quest_unlock" | "pvm_engine";

export type UnlockDefinition = {
  id: string;
  name: string;
  gateQuestId: string;
  weight: number;
  category: UnlockCategory;
  rationale: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

const VALID_CATEGORIES: UnlockCategory[] = ["infrastructure", "quest_unlock", "pvm_engine"];

export function parseUnlockDataset(input: unknown, validQuestIds: Set<string>): UnlockDefinition[] {
  if (!Array.isArray(input)) {
    throw new Error("Unlock dataset validation failed:\n- Dataset must be an array");
  }

  const errors: string[] = [];
  const unlocks: UnlockDefinition[] = [];
  const ids = new Set<string>();

  for (let i = 0; i < input.length; i += 1) {
    const item = input[i];
    if (!isRecord(item)) {
      errors.push(`- [${i}] must be an object`);
      continue;
    }

    const id = item.id;
    const name = item.name;
    const gateQuestId = item.gateQuestId;
    const weight = item.weight;
    const category = item.category;
    const rationale = item.rationale;

    if (typeof id !== "string" || id.trim() === "") {
      errors.push(`- [${i}] id must be a non-empty string`);
    }
    if (typeof name !== "string" || name.trim() === "") {
      errors.push(`- [${i}] name must be a non-empty string`);
    }
    if (typeof gateQuestId !== "string" || gateQuestId.trim() === "") {
      errors.push(`- [${i}] gateQuestId must be a non-empty string`);
    } else if (!validQuestIds.has(gateQuestId)) {
      errors.push(`- [${i}] gateQuestId references unknown quest "${gateQuestId}"`);
    }
    if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0) {
      errors.push(`- [${i}] weight must be a finite number > 0`);
    }
    if (typeof category !== "string" || !VALID_CATEGORIES.includes(category as UnlockCategory)) {
      errors.push(`- [${i}] category must be one of: ${VALID_CATEGORIES.join(", ")}`);
    }
    if (typeof rationale !== "string" || rationale.trim() === "") {
      errors.push(`- [${i}] rationale must be a non-empty string`);
    }

    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      typeof gateQuestId !== "string" ||
      typeof weight !== "number" ||
      typeof category !== "string" ||
      typeof rationale !== "string"
    ) {
      continue;
    }

    if (ids.has(id)) {
      errors.push(`- Duplicate unlock id detected: "${id}"`);
    }
    ids.add(id);

    unlocks.push({
      id,
      name,
      gateQuestId,
      weight,
      category: category as UnlockCategory,
      rationale
    });
  }

  if (errors.length > 0) {
    throw new Error(`Unlock dataset validation failed:\n${errors.join("\n")}`);
  }

  return unlocks;
}
