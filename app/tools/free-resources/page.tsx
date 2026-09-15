import type { Metadata } from "next";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Ücretsiz Kaynaklar" };

export default async function FreeResourcesPage() {
  const resources = await db.freeResource.findMany({ include: { examType: true }, orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Faydalı Araçlar</p>
      <h1 className="page-title">YDS ve YÖKDİL İçin Ücretsiz Kaynaklar</h1>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <div key={resource.id} className="panel">
            {resource.examType ? <span className="eyebrow">{resource.examType.name}</span> : null}
            <h2 className="mt-2 text-lg font-black text-[color:var(--foreground)]">{resource.title}</h2>
            {resource.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{resource.description}</p> : null}
            <span className="secondary-button mt-4 w-full justify-center">İndir</span>
          </div>
        ))}
        {resources.length === 0 ? <p className="text-slate-500">Kaynaklar yakında eklenecek.</p> : null}
      </div>
    </main>
  );
}
