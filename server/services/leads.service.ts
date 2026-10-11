import "server-only";
import { notifyAdmins } from "@/server/services/notifications.service";
import { db } from "@/server/db";
import { callbackRequestSchema, type CallbackRequestInput } from "@/lib/validation/leads";

export async function submitCallbackRequest(input: CallbackRequestInput) {
  const parsed = callbackRequestSchema.parse(input);
  const lead = await db.callbackRequest.create({ data: parsed });
  // One running note for admins; each new request refreshes it instead of adding another.
  const open = await db.callbackRequest.count({ where: { status: "NEW" } });
  await notifyAdmins({ key: "admin-leads", title: open > 1 ? `${open} yeni talep bekliyor` : "Yeni bir talep geldi", body: "Gelen talepleri incele ve öğrenciye dönüş yap.", href: "/admin/leads" }).catch(() => 0);
  return lead;
}
