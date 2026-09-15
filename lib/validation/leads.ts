import { z } from "zod";

export const callbackRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  note: z.string().trim().max(500).optional(),
  examTypeId: z.string().trim().optional(),
});

export type CallbackRequestInput = z.infer<typeof callbackRequestSchema>;
