"use server";

import { BANK_RECIPIENT_NAME } from "@/server/payments/bank-recipient";

/** "Alıcı adını göster": the name isn't in the page's HTML until asked for. */
export async function revealBankRecipientAction(): Promise<string> {
  return BANK_RECIPIENT_NAME;
}
