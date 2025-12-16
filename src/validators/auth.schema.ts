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

export const forgotPasswordJsonSchema = {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del usuario',
      },
    },
};

export const resetPasswordJsonSchema = {
    type: 'object',
    required: ['token', 'newPassword'],
    properties: {
      token: {
        type: 'string',
        description: 'Token de recuperación de contraseña',
      },
      newPassword: {
        type: 'string',
        minLength: 6,
        description: 'Nueva contraseña (mínimo 6 caracteres)',
      },
    },
};
