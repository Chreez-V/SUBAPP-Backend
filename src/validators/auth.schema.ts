import { z } from 'zod';

// Esquema para solicitar el correo
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Debe ser un correo válido" }),
});

// Esquema para enviar la nueva contraseña
export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;