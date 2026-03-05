export type NormalizedQuest = {
  title: string;
  status: string;
};

type RawQuest = {
  title?: string;
  status?: string;
};

type RawQuestsPayload = {
  quests?: RawQuest[];
};

export function normalizeQuests(raw: RawQuestsPayload): NormalizedQuest[] {
  return (raw.quests ?? []).map((q) => ({
    title: String(q.title ?? ""),
    status: String(q.status ?? "UNKNOWN")
  }));
}
