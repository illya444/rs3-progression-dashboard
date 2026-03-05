import type { PlayerSnapshot } from "../models/player.js";

const COMBAT_SKILLS = new Set([
  "Attack",
  "Strength",
  "Defence",
  "Magic",
  "Ranged",
  "Necromancy",
  "Prayer",
  "Summoning"
]);

export function getNextTargets(player: PlayerSnapshot): { priorities: string[] } {
  const priorities: string[] = [];

  const invention = player.skills.find((skill) => skill.name === "Invention");
  if (!invention || invention.level < 80) {
    priorities.push("Invention infrastructure");
  }

  const combatBelow90 = player.skills.some(
    (skill) => COMBAT_SKILLS.has(skill.name) && skill.level < 90
  );
  if (combatBelow90) {
    priorities.push("combat consolidation to 90");
  }

  priorities.push("Quest cape remaining chain");

  return { priorities };
}
