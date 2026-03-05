export type SkillSnapshot = {
  id: number;
  name: string;
  level: number;
  xp: number;
  rank: number;
  rawXp?: number;
  warnings?: string[];
};

export type PlayerSnapshot = {
  username: string;
  totalskill: number;
  totalxp: number;
  combatlevel: number;
  skills: SkillSnapshot[];
  fetchedAtIso: string;
  warnings?: string[];
};
