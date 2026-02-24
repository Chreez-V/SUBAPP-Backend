import { z } from 'zod'

// 1. Validador para cuando el pasajero reporta el pago de su tarjeta
export const payNfcRequestSchema = z.object({
    body: z.object({
    reference: z.string().min(4, 'La referencia debe tener al menos 4 caracteres'),
    }),
})

// 2. Validador para cuando el pasajero vincula el plástico con el teléfono
export const linkNfcCardSchema = z.object({
    body: z.object({
    cardUid: z.string().min(4, 'El UID de la tarjeta es obligatorio y debe ser válido'),
    }),
})

// 3. Validador para cuando el Admin rechaza una solicitud (debe dar un motivo)
export const rejectNfcRequestSchema = z.object({
    body: z.object({
    rejectionReason: z.string().min(5, 'Debe proporcionar un motivo de rechazo de al menos 5 caracteres'),
    }),
})

// 4. Validador para bloquear una tarjeta (opcionalmente con motivo)
export const blockNfcCardSchema = z.object({
    body: z.object({
    blockedReason: z.string().optional(),
    }),
})