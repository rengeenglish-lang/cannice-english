export type TopicHistoryEntry = { topicName: string; points: { date: string; accuracy: number }[] };

export function TopicHistoryList({ entries }: { entries: TopicHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-[color:var(--muted)]">Henüz geçmiş bir seviye tespit sınavın yok.</p>;
  }
  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.topicName} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--border)] p-3">
          <span className="text-sm font-bold">{entry.topicName}</span>
          <span className="text-sm font-semibold text-[color:var(--muted)]">
            {entry.points.map((p) => `%${Math.round(p.accuracy * 100)}`).join(" → ")}
          </span>
        </li>
      ))}
    </ul>
  );
}
