import type { PlayerSnapshot } from "../api/client";

type SkillOverviewProps = {
  snapshot: PlayerSnapshot;
};

export default function SkillOverview({ snapshot }: SkillOverviewProps) {
  const totalLevel = snapshot.totalLevel ?? snapshot.totalskill ?? 0;
  const totalXp = snapshot.totalXp ?? snapshot.totalxp ?? 0;
  const combatLevel = snapshot.combatLevel ?? snapshot.combatlevel ?? 0;

  return (
    <section className="card">
      <h2>Player Snapshot</h2>
      <p><strong>Username:</strong> {snapshot.username}</p>
      <p><strong>Total Level:</strong> {totalLevel}</p>
      <p><strong>Total XP:</strong> {totalXp.toLocaleString()}</p>
      <p><strong>Combat Level:</strong> {combatLevel}</p>
    </section>
  );
}
