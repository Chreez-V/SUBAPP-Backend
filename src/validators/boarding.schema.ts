import { z } from 'zod';

// Helper para validar que los IDs sean ObjectIds válidos de MongoDB
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Formato de ID inválido');

// Esquema para POST /api/abordaje/pagar-nfc
export const pagarNfcSchema = z.object({
  body: z.object({
    cardUid: z.string().min(1, 'El UID de la tarjeta es requerido').trim(),
    routeId: objectIdSchema,
    tripId: objectIdSchema.optional(),
  }),
});

// Esquema para POST /api/abordaje/generar-qr
export const generarQrSchema = z.object({
  body: z.object({
    routeId: objectIdSchema,
    tripId: objectIdSchema.optional(),
  }),
});

// Esquema para POST /api/abordaje/pagar-qr
export const pagarQrSchema = z.object({
  body: z.object({
    qrToken: z.string().min(1, 'El token del QR es requerido').trim(),
  }),
});