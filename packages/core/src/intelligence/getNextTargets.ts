export type Recommendation = {
  type: "quest" | "skill";
  title: string;
  reason: string;
};

export type RecommendationInput = {
  profile: {
    username: string;
    totalLevel: number;
    totalXp: number;
    skills: Array<{ id: number; level: number; xp: number }>;
  };
  quests: Array<{ title: string; status: string }>;
  unlocks?: Array<{ id: string; name: string }>;
};

export function getIntelligenceTargets(input: RecommendationInput): Recommendation[] {
  const completed = input.quests.filter((q) => q.status.toUpperCase() === "COMPLETED").length;
  const total = input.quests.length;

  const recs: Recommendation[] = [];

  if (total > 0 && completed < total) {
    recs.push({
      type: "quest",
      title: "Advance quest progression",
      reason: `${completed}/${total} quests marked completed in current snapshot`
    });
  }

  const lowSkill = [...input.profile.skills].sort((a, b) => a.level - b.level)[0];
  if (lowSkill) {
    recs.push({
      type: "skill",
      title: `Train skill ${lowSkill.id}`,
      reason: `Current level ${lowSkill.level}`
    });
  }

  for (const unlock of input.unlocks ?? []) {
    recs.push({
      type: "quest",
      title: `Work toward unlock: ${unlock.name}`,
      reason: `Unlock id ${unlock.id}`
    });
    if (recs.length >= 5) break;
  }

  return recs.slice(0, 5);
}
