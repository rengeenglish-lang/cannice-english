import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(40).regex(/^[A-Z0-9-]+$/, "Sadece büyük harf, rakam ve tire kullanın"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().positive(),
  description: z.string().trim().max(200).optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
  isPublic: z.coerce.boolean().default(false),
  minOrderAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  maxRedemptions: z.coerce.number().int().min(1).optional().or(z.literal("")),
  expiresAt: z.string().trim().optional().or(z.literal("")),
});
