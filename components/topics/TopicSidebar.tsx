import {
  Check,
  Mic,
  PenLine,
  BookOpen,
  Headphones,
  Target,
  Sprout,
} from "lucide-react";

type Topic = {
  id: string;
  name: string;
  category: string | null;
};

const CATEGORY_META: Record<string, { label: string; Icon: typeof Mic }> = {
  SPEAKING: { label: "Konuşma", Icon: Mic },
  WRITING: { label: "Yazma", Icon: PenLine },
  READING: { label: "Okuma", Icon: BookOpen },
  LISTENING: { label: "Dinleme", Icon: Headphones },
};

const CARD =
  "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(12,46,30,.07)]";

export function TopicSidebar<T extends Topic>({
  examName,
  topics,
  groups,
  selectedTopicId,
  completedTopicCount,
  topicCompleted,
  topicPercent,
  onSelect,
}: {
  examName: string;
  topics: T[];
  groups: { category: string | null; topics: T[] }[];
  selectedTopicId: string | undefined;
  completedTopicCount: number;
  topicCompleted: (topic: T) => boolean;
  topicPercent: (topic: T) => number;
  onSelect: (topic: T) => void;
}) {
  return (
    <aside className="order-2 h-fit lg:order-1 lg:sticky lg:top-24">
      <div className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Target className="size-6 text-[color:var(--accent)]" />
            {examName} Konuları
          </p>
          <p className="text-base font-extrabold text-[color:var(--accent-strong)]">
            {completedTopicCount} / {topics.length}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${topics.length > 0 ? Math.round((completedTopicCount / topics.length) * 100) : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {groups.map((group) => {
          const meta = group.category ? CATEGORY_META[group.category] : null;
          const RowIcon = meta?.Icon ?? BookOpen;
          const body = (
            <ul className="space-y-2">
              {group.topics.map((topic) => {
                const globalIndex = topics.findIndex(
                  (item) => item.id === topic.id,
                );
                const active = topic.id === selectedTopicId;
                const done = topicCompleted(topic);
                const percent = topicPercent(topic);
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(topic)}
                      className={`flex w-full flex-col gap-2.5 rounded-2xl border px-4 py-3.5 text-left transition ${
                        active
                          ? "border-transparent bg-[color:var(--brand)] text-white shadow-[0_10px_24px_rgba(19,47,89,.25)]"
                          : "border-[color:var(--border)] bg-white text-slate-800 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                            active ? "bg-white/15" : "bg-[color:var(--accent-soft)]"
                          }`}
                        >
                          {done ? (
                            <Check
                              className={`size-5 ${active ? "text-white" : "text-[color:var(--success)]"}`}
                            />
                          ) : (
                            <RowIcon
                              className={`size-5 ${active ? "text-white" : "text-[color:var(--accent)]"}`}
                            />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-base font-bold leading-snug">
                          {globalIndex + 1}. {topic.name}
                        </span>
                        <span
                          className={`shrink-0 text-sm font-black ${active ? "text-white" : "text-[color:var(--accent-strong)]"}`}
                        >
                          %{percent}
                        </span>
                      </span>
                      <span
                        className={`h-1.5 w-full overflow-hidden rounded-full ${active ? "bg-white/20" : "bg-slate-100"}`}
                      >
                        <span
                          className={`block h-full rounded-full transition-all ${
                            done ? "bg-emerald-400" : active ? "bg-white" : "bg-[color:var(--accent)]"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          );
          if (!meta)
            return (
              <div key="flat" className={CARD}>
                {body}
              </div>
            );
          const { label, Icon } = meta;
          return (
            <details key={group.category} className={`${CARD} group`} open>
              <summary className="flex cursor-pointer list-none items-center gap-2 text-lg font-extrabold text-slate-900">
                <Icon className="size-5 text-[color:var(--accent)]" />
                <span>
                  {label} ({group.topics.length})
                </span>
              </summary>
              <div className="mt-3 border-t border-slate-100 pt-3">{body}</div>
            </details>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-4 text-center">
        <Sprout className="mx-auto size-8 text-emerald-600" />
        <p className="mt-2 text-base font-extrabold leading-snug text-emerald-900">
          Küçük adımlar, büyük sonuçlar
        </p>
      </div>
    </aside>
  );
}
