import type { QuestGraph } from "../questGraph/questGraphBuilder.js";
import type { UnlockDefinition } from "./unlockDataset.js";

export type ScoredUnlock = {
  unlock: UnlockDefinition;
  score: number;
  missingQuestIds: string[];
  estimatedDepth: number;
  reasons: string[];
};

export function scoreLockedUnlocks(
  lockedUnlocks: UnlockDefinition[],
  completedQuestIds: Set<string>,
  questGraph: QuestGraph
): ScoredUnlock[] {
  const scored = lockedUnlocks.map((unlock) => {
    const topo = questGraph.topoSortSubgraph(unlock.gateQuestId);
    const missingQuestIds = topo.filter((id) => !completedQuestIds.has(id));
    const estimatedDepth = Math.max((questGraph.depthById.get(unlock.gateQuestId) ?? 0) + 1, 1);
    const missingPenalty = Math.max(missingQuestIds.length - 1, 0);
    const score = unlock.weight * 10 - missingPenalty * 8 - estimatedDepth * 3;

    const reasons = [
      unlock.rationale,
      `Gate quest: ${unlock.gateQuestId}`,
      `Missing quest chain length: ${missingQuestIds.length}`
    ];

    return { unlock, score, missingQuestIds, estimatedDepth, reasons };
  });

  return scored.sort((a, b) => b.score - a.score || a.unlock.name.localeCompare(b.unlock.name));
}
