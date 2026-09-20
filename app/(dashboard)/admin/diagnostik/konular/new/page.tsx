import Link from "next/link";
import type { Metadata } from "next";
import { DiagnosticTopicForm } from "@/components/admin/DiagnosticTopicForm";
import { createDiagnosticTopicAction } from "@/app/actions/admin-diagnostic-topics";

export const metadata: Metadata = { title: "Yeni Konu" };

export default function NewDiagnosticTopicPage() {
  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/diagnostik/konular" className="hover:underline">Seviye Tespit Konuları</Link> › Yeni
      </p>
      <h1 className="page-title">Yeni Konu</h1>
      <div className="mt-8 max-w-2xl">
        <DiagnosticTopicForm topic={null} action={createDiagnosticTopicAction} />
      </div>
    </div>
  );
}
