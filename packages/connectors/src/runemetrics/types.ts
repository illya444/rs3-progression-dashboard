export type RuneMetricsSkill = {
  id: number;
  level: number;
  // RuneMetrics profile payload currently returns this field as rank-like data.
  xp: number;
  // RuneMetrics profile payload currently returns this field as xp-like data.
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
