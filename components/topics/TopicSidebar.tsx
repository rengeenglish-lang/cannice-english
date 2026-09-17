import { Mic, PenLine, BookOpen, Headphones, Target, Sprout } from "lucide-react";

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
  "relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/80 before:via-white/0 before:content-['']";

export function TopicSidebar<T extends Topic>({
  examName,
  topics,
  groups,
  selectedTopicId,
  completedTopicCount,
  topicCompleted,
  onSelect,
}: {
  examName: string;
  topics: T[];
  groups: { category: string | null; topics: T[] }[];
  selectedTopicId: string | undefined;
  completedTopicCount: number;
  topicCompleted: (topic: T) => boolean;
  onSelect: (topic: T) => void;
}) {
  return (
    <aside className="order-2 h-fit lg:order-1 lg:sticky lg:top-24">
      <div className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <Target className="size-5 text-blue-600" />
            {examName} Konuları
          </p>
          <p className="text-sm font-extrabold text-slate-500">
            {completedTopicCount} / {topics.length}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${topics.length > 0 ? Math.round((completedTopicCount / topics.length) * 100) : 0}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {groups.map((group) => {
          const meta = group.category ? CATEGORY_META[group.category] : null;
          const body = (
            <ul className="space-y-1.5">
              {group.topics.map((topic) => {
                const globalIndex = topics.findIndex((item) => item.id === topic.id);
                const active = topic.id === selectedTopicId;
                const done = topicCompleted(topic);
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(topic)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-base transition ${
                        active ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,.25)]" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full border-2 text-xs font-black ${
                          done
                            ? "border-emerald-400 bg-emerald-400 text-white"
                            : active
                              ? "border-white/70 text-transparent"
                              : "border-slate-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1 font-bold leading-snug">
                        {globalIndex + 1}. {topic.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          );
          if (!meta) return <div key="flat" className={CARD}>{body}</div>;
          const { label, Icon } = meta;
          return (
            <details key={group.category} className={`${CARD} group`} open>
              <summary className="flex cursor-pointer list-none items-center gap-2 text-base font-extrabold text-slate-900">
                <Icon className="size-4 text-blue-600" />
                <span>
                  {label} ({group.topics.length})
                </span>
              </summary>
              <div className="mt-3 border-t border-slate-100 pt-3">{body}</div>
            </details>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4 text-center">
        <Sprout className="mx-auto size-7 text-emerald-600" />
        <p className="mt-2 text-sm font-extrabold leading-snug text-slate-800">Küçük adımlar, büyük sonuçlar</p>
      </div>
    </aside>
  );
}
