"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/server/auth/context";
import { db } from "@/server/db";

export type ResourceFormState = { status: "idle" | "error" | "success"; message?: string };

const schema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  fileUrl: z.url().refine((u) => /^https?:\/\//i.test(u), "Bağlantı http(s) ile başlamalı."),
  examTypeId: z.string().min(1, "Sınav seçin."),
  kind: z.enum(["E_BOOK", "TOPIC", "PDF_MOCK"]),
});

function slugify(value: string) {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return value.toLowerCase().replace(/[çğıöşüİ]/g, (c) => map[c] ?? c).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export async function createResourceAction(_state: ResourceFormState, formData: FormData): Promise<ResourceFormState> {
  await requireStaff();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Lütfen alanları kontrol edin." };
  const { title, description, fileUrl, examTypeId, kind } = parsed.data;
  await db.freeResource.create({
    data: { title, description: description || null, fileUrl, examTypeId, kind, slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}` },
  });
  revalidatePath("/admin/kaynaklar");
  return { status: "success", message: "Kaynak eklendi." };
}

export async function deleteResourceAction(id: string) {
  await requireStaff();
  await db.freeResource.delete({ where: { id } });
  revalidatePath("/admin/kaynaklar");
}
