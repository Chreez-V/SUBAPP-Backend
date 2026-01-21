import { z } from 'zod';

export const createAdminSchema = z.object({
    fullName: z.string().min(2, "El nombre completo debe tener al menos 2 caracteres"),
    email: z.string().email({ message: "Debe ser un correo válido" }),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    phone: z.string().optional()
});

export const updateAdminSchema = z.object({
    fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
    email: z.string().email({ message: "Debe ser un correo válido" }).optional(),
    phone: z.string().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar"
});

export const loginAdminSchema = z.object({
    email: z.string().email({ message: "Debe ser un correo válido" }),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type LoginAdminInput = z.infer<typeof loginAdminSchema>;

export const createAdminJsonSchema = {
    type: 'object',
    required: ['fullName', 'email', 'password'],
    properties: {
        fullName: {
            type: 'string',
            minLength: 2,
            description: 'Nombre completo del administrador',
        },
        email: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico único del administrador',
        },
        password: {
            type: 'string',
            minLength: 6,
            description: 'Contraseña (mínimo 6 caracteres)',
        },
        phone: {
            type: 'string',
            description: 'Teléfono de contacto (opcional)'
        }
    },
};

export const updateAdminJsonSchema = {
    type: 'object',
    properties: {
        fullName: {
            type: 'string',
            minLength: 2,
            description: 'Nuevo nombre completo',
        },
        email: {
            type: 'string',
            format: 'email',
            description: 'Nuevo correo electrónico',
        },
        phone: {
            type: 'string',
            description: 'Nuevo teléfono de contacto'
        }
    },
};

export const loginAdminJsonSchema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico del administrador',
        },
        password: {
            type: 'string',
            minLength: 6,
            description: 'Contraseña del administrador',
        }
    },
};

export const adminResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['admin'] },
        phone: { type: 'string', nullable: true },
        lastLogin: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};

export const adminsListResponseSchema = {
    type: 'array',
    items: adminResponseSchema
};
