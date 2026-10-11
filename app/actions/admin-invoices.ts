"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { backfillInvoices, saveInvoiceSettings, setEtimsNumber, syncDirtyInvoices, syncInvoiceToDrive } from "@/server/services/invoices.service";
import { disconnectDrive } from "@/server/google/drive";

export type InvoiceActionState = { status: "idle" | "error" | "success"; message?: string };

async function requireAdmin() {
  const actor = await getAuthContext();
  return actor?.role === "ADMIN" ? actor : null;
}

const text = (formData: FormData, name: string, max = 300) => String(formData.get(name) ?? "").trim().slice(0, max);

export async function saveInvoiceSettingsAction(_prev: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  if (!(await requireAdmin())) return { status: "error", message: "Yönetici oturumu gerekli." };
  const taxRate = Number(text(formData, "taxRate", 6).replace(",", "."));
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate >= 100) return { status: "error", message: "Vergi oranı 0 ile 99 arasında olmalı." };
  await saveInvoiceSettings(
    {
      name: text(formData, "name", 160),
      address: text(formData, "address", 400),
      country: text(formData, "country", 80) || "Kenya",
      taxId: text(formData, "taxId", 40),
      trVatNumber: text(formData, "trVatNumber", 40),
      email: text(formData, "email", 160),
      phone: text(formData, "phone", 40),
      note: text(formData, "note", 600),
    },
    taxRate,
  );
  revalidatePath("/admin/faturalar");
  return { status: "success", message: "Fatura bilgileri kaydedildi. Yeni faturalarda kullanılacak." };
}

export async function backfillInvoicesAction(): Promise<void> {
  if (!(await requireAdmin())) return;
  await backfillInvoices();
  await syncDirtyInvoices(50);
  revalidatePath("/admin/faturalar");
}

export async function syncInvoicesAction(): Promise<void> {
  if (!(await requireAdmin())) return;
  await syncDirtyInvoices(50);
  revalidatePath("/admin/faturalar");
}

export async function syncInvoiceAction(id: string): Promise<void> {
  if (!(await requireAdmin())) return;
  await syncInvoiceToDrive(id);
  revalidatePath("/admin/faturalar");
}

export async function setEtimsNumberAction(id: string, formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;
  await setEtimsNumber(id, text(formData, "etims", 60));
  await syncInvoiceToDrive(id);
  revalidatePath("/admin/faturalar");
}

export async function disconnectDriveAction(): Promise<void> {
  if (!(await requireAdmin())) return;
  await disconnectDrive();
  revalidatePath("/admin/faturalar");
}
