export type SkillSnapshot = {
  id: number;
  name: string;
  level: number;
  xp: number;
  rank: number;
};

export type PlayerSnapshot = {
  username: string;
  totalskill: number;
  totalxp: number;
  combatlevel: number;
  skills: SkillSnapshot[];
  fetchedAtIso: string;
};
