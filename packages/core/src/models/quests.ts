export type QuestStatus = "COMPLETED" | "STARTED" | "NOT_STARTED" | "UNKNOWN";

export type QuestEntry = {
  title: string;
  status: QuestStatus;
  difficulty?: string;
  questPoints?: number;
  members?: boolean;
  userEligible?: boolean;
};

export type QuestSnapshot = {
  username: string;
  quests: QuestEntry[];
  fetchedAtIso: string;
};
