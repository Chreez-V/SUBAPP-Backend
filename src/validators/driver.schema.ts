import { z } from 'zod';

export const createDriverSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener por lo menos 2 caracteres"),
    email: z.string().email({ message: "Por favor, ingrese un correo válido" }),
    password: z.string().min(5, "La contraseña debe tener por lo menos 5 caracteres"),
    numeroLicencia: z.string().min(1, "Número de licencia obligatorio"),
    telefono: z.string().min(7, "Por favor, ingrese un número de teléfono válido"),
    estado: z.enum(['Activo', 'Inactivo']).optional()
})

export const updateDriverSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener por lo menos 2 caracteres").optional(),
    email: z.string().email({ message: "Por favor, ingrese un correo válido" }).optional(),
    password: z.string().min(5, "La contraseña debe tener por lo menos 5 caracteres").optional(),
    numeroLicencia: z.string().min(1, "Número de licencia obligatorio").optional(),
    telefono: z.string().min(7, "Por favor, ingrese un número de teléfono válido").optional(),
    estado: z.enum(['Activo', 'Inactivo']).optional()
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>

export const createDriverJsonSchema = {
    type: 'object',
    required: ['nombre', 'email', 'password', 'numeroLicencia', 'telefono'],
    properties: {
        nombre: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 5 },
        numeroLicencia: { type: 'string' },
        telefono: { type: 'string' },
        estado: { type: 'string', enum: ['Activo', 'Inactivo'] }
    },
}

export const updateDriverJsonSchema = {
    type: 'object',
    properties: {
        nombre: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 5 },
        numeroLicencia: { type: 'string' },
        telefono: { type: 'string' },
        estado: { type: 'string', enum: ['Activo', 'Inactivo'] }
    },
}

export const driverResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        nombre: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['driver'] },
        numeroLicencia: { type: 'string' },
        telefono: { type: 'string' },
        estado: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
}

export const driversListResponseSchema = {
    type: 'array',
    items: driverResponseSchema
}