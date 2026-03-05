import { useMemo, useState } from "react";
import {
  fetchPlayerSnapshot,
  fetchQuestProgress,
  fetchRecommendations,
  type PlayerSnapshot,
  type QuestItem
} from "../api/client";
import SkillOverview from "../components/SkillOverview";
import QuestProgress from "../components/QuestProgress";
import RecommendationPanel from "../components/RecommendationPanel";

export default function Dashboard() {
  const [username, setUsername] = useState("ILLYA444");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<PlayerSnapshot | null>(null);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  const canLoad = useMemo(() => username.trim().length > 0, [username]);

  const loadDashboard = async () => {
    if (!canLoad) return;
    setLoading(true);
    setError(null);

    try {
      const [profileData, questData, recommendationData] = await Promise.all([
        fetchPlayerSnapshot(username.trim()),
        fetchQuestProgress(username.trim()),
        fetchRecommendations(username.trim())
      ]);

      setSnapshot(profileData);
      setQuests(Array.isArray(questData) ? questData : []);
      setActions(Array.isArray(recommendationData.priorities) ? recommendationData.priorities : []);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unknown request error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>RS3 Progression Dashboard</h1>
        <div className="controls">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username"
            aria-label="RS3 username"
          />
          <button onClick={loadDashboard} disabled={!canLoad || loading}>
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </header>

      <section className="grid">
        {snapshot ? <SkillOverview snapshot={snapshot} /> : <section className="card">Load player data.</section>}
        <QuestProgress quests={quests} />
        <RecommendationPanel actions={actions} />
      </section>
    </main>
  );
}
