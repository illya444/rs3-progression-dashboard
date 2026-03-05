export type RuneMetricsSkill = {
  id: number;
  level: number;
  xp: number;
  rank: number;
};

export type RuneMetricsProfileResponse = {
  name: string;
  combatlevel: number;
  totalskill: number;
  totalxp: number;
  skillvalues: RuneMetricsSkill[];
};

export type RuneMetricsQuest = {
  title: string;
  status: string;
  difficulty?: string;
  questPoints?: number;
  members?: boolean;
  userEligible?: boolean;
};

export type RuneMetricsQuestsResponse = {
  name: string;
  quests: RuneMetricsQuest[];
};
