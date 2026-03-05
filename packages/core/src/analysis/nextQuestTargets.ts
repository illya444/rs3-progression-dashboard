import type { PlayerSnapshot } from "../models/player.js";
import type { QuestSnapshot } from "../models/quests.js";
import type { QuestGraph } from "../questGraph/questGraphBuilder.js";
import { getCompletedQuestIds, resolveQuests } from "../questGraph/questResolver.js";
import type { UnlockDefinition } from "../unlocks/unlockDataset.js";
import { resolveUnlocks } from "../unlocks/unlockResolver.js";
import { scoreLockedUnlocks } from "../unlocks/unlockScoring.js";

export type RecommendationType = "infrastructure" | "quest_unlock" | "pvm_engine" | "skill_training";

export type Recommendation = {
  title: string;
  type: RecommendationType;
  score: number;
  reasons: string[];
};

export type ProgressionAnalysis = {
  player: string;
  recommendations: Recommendation[];
};

function toTitleCase(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
}

export function getProgressionRecommendations(
  player: PlayerSnapshot,
  questSnapshot: QuestSnapshot | undefined,
  questGraph: QuestGraph,
  unlocks: UnlockDefinition[]
): ProgressionAnalysis {
  const completedQuestIds = getCompletedQuestIds(questSnapshot, questGraph);
  const resolvedQuests = resolveQuests(player, questGraph, completedQuestIds);
  const unlockResolution = resolveUnlocks(unlocks, completedQuestIds);
  const scoredUnlocks = scoreLockedUnlocks(unlockResolution.locked, completedQuestIds, questGraph);

  const recommendations: Recommendation[] = [];

  for (const unlock of scoredUnlocks.slice(0, 5)) {
    recommendations.push({
      title: `Unlock ${unlock.unlock.name}`,
      type: unlock.unlock.category,
      score: unlock.score,
      reasons: unlock.reasons
    });
  }

  for (const quest of resolvedQuests.availableQuests.slice(0, 5)) {
    const tagBoost = quest.unlockTags.includes("prifddinas") ? 20 : 0;
    const score = 70 + tagBoost - (questGraph.depthById.get(quest.id) ?? 0) * 2;
    recommendations.push({
      title: `Complete ${quest.name}`,
      type: "quest_unlock",
      score,
      reasons: ["Quest available now", `Unlock tags: ${quest.unlockTags.join(", ") || "none"}`]
    });
  }

  for (const missing of resolvedQuests.missingRequirements.slice(0, 5)) {
    const gap = missing.missingSkills[0];
    if (!gap) continue;
    recommendations.push({
      title: `Train ${toTitleCase(gap.skill)} to ${gap.required}`,
      type: "skill_training",
      score: 65 - (gap.required - gap.current),
      reasons: [`Blocks ${missing.questName}`, `${gap.current}/${gap.required} ${gap.skill}`]
    });
  }

  const deduped = new Map<string, Recommendation>();
  for (const rec of recommendations) {
    const existing = deduped.get(rec.title);
    if (!existing || rec.score > existing.score) deduped.set(rec.title, rec);
  }

  return {
    player: player.username,
    recommendations: Array.from(deduped.values()).sort(
      (a, b) => b.score - a.score || a.title.localeCompare(b.title)
    )
  };
}
