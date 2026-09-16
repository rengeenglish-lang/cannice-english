import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  nationalId: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "T.C. Kimlik Numarası 11 haneli olmalıdır.")
    .optional()
    .or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  occupation: z.string().trim().max(120).optional().or(z.literal("")),
  educationLevel: z.string().trim().max(60).optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
