export type NormalizedProfile = {
  username: string;
  combatLevel: number;
  totalLevel: number;
  totalXp: number;
  skills: Array<{ id: number; level: number; xp: number }>;
};

type RawSkill = {
  id: number;
  level: number;
  xp: number;
  rank?: number;
};

type RawProfile = {
  name?: string;
  combatlevel?: number;
  totalskill?: number;
  totalxp?: number;
  skillvalues?: RawSkill[];
};

export function normalizeProfile(raw: RawProfile): NormalizedProfile {
  return {
    username: String(raw.name ?? ""),
    combatLevel: Number(raw.combatlevel ?? 0),
    totalLevel: Number(raw.totalskill ?? 0),
    totalXp: Number(raw.totalxp ?? 0),
    skills: (raw.skillvalues ?? []).map((s) => ({
      id: Number(s.id ?? 0),
      level: Number(s.level ?? 0),
      xp: Number(s.xp ?? 0)
    }))
  };
}
