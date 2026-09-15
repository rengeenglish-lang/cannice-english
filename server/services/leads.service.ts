import "server-only";
import { db } from "@/server/db";
import { callbackRequestSchema, type CallbackRequestInput } from "@/lib/validation/leads";

export async function submitCallbackRequest(input: CallbackRequestInput) {
  const parsed = callbackRequestSchema.parse(input);
  return db.callbackRequest.create({ data: parsed });
}
