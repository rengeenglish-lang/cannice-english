import { z } from "zod";

export const guestCheckoutSchema = z.object({
  guestName: z.string().trim().min(2).max(120),
  guestEmail: z.email(),
  guestPhone: z.string().trim().min(7).max(20),
});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;
