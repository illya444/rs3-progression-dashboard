export type XpHistoryPoint = {
  createdAt: string;
  totalXp: number;
};

export function normalizeXpHistory(
  rows: Array<{ created_at?: unknown; total_xp?: unknown }>
): XpHistoryPoint[] {
  return rows
    .map((row) => ({
      createdAt: String(row.created_at ?? ""),
      totalXp: Number(row.total_xp ?? 0)
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
