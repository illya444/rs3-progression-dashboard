import type { UnlockDefinition } from "./unlockDataset.js";

export type UnlockResolution = {
  unlocked: UnlockDefinition[];
  locked: UnlockDefinition[];
};

export function resolveUnlocks(
  unlocks: UnlockDefinition[],
  completedQuestIds: Set<string>
): UnlockResolution {
  const unlocked: UnlockDefinition[] = [];
  const locked: UnlockDefinition[] = [];

  for (const unlock of unlocks) {
    if (completedQuestIds.has(unlock.gateQuestId)) {
      unlocked.push(unlock);
    } else {
      locked.push(unlock);
    }
  }

  return { unlocked, locked };
}
