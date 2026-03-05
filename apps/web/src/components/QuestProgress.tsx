import type { QuestItem } from "../api/client";

type QuestProgressProps = {
  quests: QuestItem[];
};

export default function QuestProgress({ quests }: QuestProgressProps) {
  const completed = quests.filter((quest) => quest.status.toUpperCase() === "COMPLETED").length;

  return (
    <section className="card">
      <h2>Quest Progress</h2>
      <p>{completed} / {quests.length} completed</p>
      <ul className="list">
        {quests.slice(0, 8).map((quest) => (
          <li key={quest.title}>
            {quest.title} - {quest.status}
          </li>
        ))}
      </ul>
    </section>
  );
}
