import type { PlayerSnapshot } from "../models/player.js";
import type { QuestSnapshot } from "../models/quests.js";
import { QUEST_DATASET } from "../questGraph/questDataset.js";
import { buildQuestGraph } from "../questGraph/questGraphBuilder.js";
import {
  getAvailableQuests,
  getBlockedQuests,
  getCompletedQuestNames
} from "../questGraph/questResolver.js";

function toTitleCase(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
}

export function getNextQuestTargets(player: PlayerSnapshot, questSnapshot?: QuestSnapshot): string[] {
  const questGraph = buildQuestGraph(QUEST_DATASET);
  const completed = getCompletedQuestNames(questSnapshot);
  const available = getAvailableQuests(player, questGraph, completed);
  const blocked = getBlockedQuests(player, questGraph, completed);
  const recommendations: string[] = [];

  for (const quest of available.slice(0, 3)) {
    recommendations.push(`Complete ${quest.name}`);
  }

  for (const blockedQuest of blocked) {
    const gap = blockedQuest.missingSkills[0];
    if (!gap) continue;
    const rec = `Train ${toTitleCase(gap.skill)} to ${gap.required}`;
    if (!recommendations.includes(rec)) {
      recommendations.push(rec);
    }
    if (recommendations.length >= 5) break;
  }

  for (const blockedQuest of blocked) {
    for (const missingQuest of blockedQuest.missingQuests) {
      const rec = `Complete ${missingQuest}`;
      if (!recommendations.includes(rec)) {
        recommendations.push(rec);
      }
      if (recommendations.length >= 5) break;
    }
    if (recommendations.length >= 5) break;
  }

  return recommendations.slice(0, 5);
}
