"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Library, ArrowRight, Mic2 } from "lucide-react";

const RESOURCES = [
  {
    key: "konu-anlatim",
    label: "Konu Anlatım",
    href: "/konu-anlatim",
    icon: BookOpen,
    title: "Konu Anlatım",
    description:
      "Sınavınızın her konusunu sıfırdan öğrenin; kurallar referansları ve örnek sorularla adım adım ilerleyin.",
  },
  {
    key: "kitaplar",
    label: "Kaynaklar",
    href: "/books",
    icon: Library,
    title: "Kaynaklar",
    description:
      "Sınav uzmanları tarafından hazırlanan kelime kitaplarını ve deneme setlerini basılı veya dijital formatta edinin.",
  },
  {
    key: "toefl-speaking",
    label: "TOEFL iBT Speaking",
    href: "/dashboard/speaking-practice/toefl",
    icon: Mic2,
    title: "TOEFL iBT Speaking",
    description:
      "Güncel TOEFL iBT formatındaki Listen and Repeat ve Take an Interview görevlerini tarayıcınızda uygulayın.",
  },
  {
    key: "ielts-speaking",
    label: "IELTS Speaking",
    href: "/dashboard/speaking-practice/ielts",
    icon: Mic2,
    title: "IELTS Speaking",
    description:
      "IELTS Speaking Part 1, Part 2 ve Part 3 akışlarını tek görev veya tam deneme modunda çalışın.",
  },
] as const;

export function KaynaklarHub() {
  const [selected, setSelected] = useState<(typeof RESOURCES)[number]["key"]>(
    RESOURCES[0].key,
  );
  const active = RESOURCES.find((resource) => resource.key === selected) ?? RESOURCES[0];
  const Icon = active.icon;

  return (
    <div className="mt-8">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Kaynak türü"
      >
        {RESOURCES.map((resource) => (
          <button
            key={resource.key}
            type="button"
            role="tab"
            aria-selected={selected === resource.key}
            onClick={() => setSelected(resource.key)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              selected === resource.key
                ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                : "border-[color:var(--border-strong)] bg-white text-slate-600 hover:border-[color:var(--brand)]"
            }`}
          >
            {resource.label}
          </button>
        ))}
      </div>

      <div className="panel mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
            <Icon className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[color:var(--foreground)]">
              {active.title}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
              {active.description}
            </p>
          </div>
        </div>
        <Link
          href={active.href}
          className="primary-button shrink-0 justify-center whitespace-nowrap"
        >
          Görüntüle
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
