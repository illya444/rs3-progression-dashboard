type RecommendationPanelProps = {
  actions: string[];
};

export default function RecommendationPanel({ actions }: RecommendationPanelProps) {
  return (
    <section className="card">
      <h2>Recommended Next Actions</h2>
      <ol className="list numbered">
        {actions.length === 0 ? <li>No recommendations available.</li> : null}
        {actions.map((action, index) => (
          <li key={`${action}-${index}`}>{action}</li>
        ))}
      </ol>
    </section>
  );
}
