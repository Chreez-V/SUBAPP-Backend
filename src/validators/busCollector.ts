import { z } from 'zod';

// --- ZOD SCHEMAS (Lógica de Negocio / TypeScript) ---

export const createCollectorSchema = z.object({
    fullName: z.string().min(2, "El nombre completo debe tener al menos 2 caracteres"),
    email: z.string().email({ message: "Debe ser un correo electrónico válido" }),
    phone: z.string().min(7, "El teléfono debe tener al menos 7 caracteres"),
    cedula: z.string().min(5, "La cédula debe ser válida"),
    birthDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    assignedBusId: z.string().min(1, "Debe asignar un ID de bus"),
    status: z.enum(['active', 'inactive']).default('active'),
});

export const updateCollectorSchema = z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    cedula: z.string().optional(),
    assignedBusId: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar"
});

export const assignBusSchema = z.object({
    assignedBusId: z.string().min(1, "El ID del bus es requerido")
});

export type CreateCollectorInput = z.infer<typeof createCollectorSchema>;
export type UpdateCollectorInput = z.infer<typeof updateCollectorSchema>;

// --- JSON SCHEMAS (Fastify / Swagger) ---

export const collectorResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        cedula: { type: 'string' },
        birthDate: { type: 'string', format: 'date', nullable: true },
        assignedBusId: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive'] },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};

export const createCollectorJsonSchema = {
    type: 'object',
    required: ['fullName', 'email', 'phone', 'cedula', 'assignedBusId'],
    properties: {
        fullName: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        cedula: { type: 'string' },
        birthDate: { type: 'string', format: 'date' },
        assignedBusId: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive'], default: 'active' }
    },
};

export const updateCollectorJsonSchema = {
    type: 'object',
    properties: {
        fullName: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        cedula: { type: 'string' },
        assignedBusId: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive'] }
    },
};

export const collectorsListResponseSchema = {
    type: 'array',
    items: collectorResponseSchema
};

export const assignBusJsonSchema = {
    type: 'object',
    required: ['assignedBusId'],
    properties: {
        assignedBusId: { 
            type: 'string', 
            description: 'ID o placa de la unidad de bus asignada' 
        }
    }
};