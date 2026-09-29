import type { EbookPitch } from "@/lib/netfener-ebook-copy";

/** The sales panel on an e-book page: the one block a visitor reads before deciding. */
export function EbookPitchPanel({ title, pitch }: { title: string; pitch: EbookPitch }) {
  return (
    <section
      aria-label={`${title} hakkında`}
      className="relative mt-10 overflow-hidden rounded-[24px] bg-[color:var(--brand)] text-white shadow-[0_18px_50px_rgba(7,27,52,.18)]"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[color:var(--accent)]" />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[color:var(--accent)] opacity-[.07]"
      />

      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[color:var(--gold)]">
          Kitap hakkında
        </p>
        <p className="mt-4 max-w-3xl text-lg leading-8 font-semibold sm:text-xl sm:leading-9">
          {pitch.lead}
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {pitch.facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-white/15 bg-white/[.06] px-4 py-3 text-center"
            >
              <dt className="text-[11px] font-bold uppercase tracking-[.12em] text-white/60">
                {fact.label}
              </dt>
              <dd className="mt-1 text-xl font-black text-[color:var(--gold)]">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-9 grid gap-7 sm:grid-cols-2">
          {pitch.sections.map((section) => (
            <div key={section.title} className="border-t border-white/15 pt-5">
              <h3 className="flex items-baseline gap-2 text-base font-extrabold text-[color:var(--gold)]">
                <span aria-hidden className="text-sm">
                  ✦
                </span>
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-white/80">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-3 space-y-1.5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm leading-6 text-white/75">
                      <span aria-hidden className="mt-[2px] text-[color:var(--accent)]">
                        ▸
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>

        <p className="mt-9 border-t border-[color:var(--accent)]/40 pt-5 text-base font-bold italic text-[color:var(--gold)]">
          {pitch.closing}
        </p>
      </div>
    </section>
  );
}
