import { FastifyInstance } from 'fastify';
import { requireRole } from '../../middlewares/requireRole.js';

// Importar los controladores
import { pagarNfcController } from '../../controllers/abordaje/pagarNfc.controller.js';
import { generarQrController } from '../../controllers/abordaje/generarQr.controller.js';
import { pagarQrController } from '../../controllers/abordaje/pagarQr.controller.js';
import { getHistorialController } from '../../controllers/abordaje/getHistorial.controller.js'; 
import { conductorRegistroController } from '../../controllers/abordaje/conductorRegistro.controller.js';

import isAuth from '../../middlewares/isAuth.js';

// ── Esquemas JSON reutilizables ────────────────────────────────────────

const transactionSchema = {
  type: 'object',
  properties: {
    _id:              { type: 'string', description: 'ID de la transacción (ObjectId)' },
    userId:           { type: 'string', description: 'ID del usuario asociado' },
    type:             { type: 'string', enum: ['pago_pasaje_nfc', 'pago_pasaje_qr', 'pago_pasaje_movil', 'cobro_pasaje'], description: 'Tipo de transacción' },
    amount:           { type: 'number', description: 'Monto de la transacción' },
    previousBalance:  { type: 'number', description: 'Saldo antes de la transacción' },
    newBalance:       { type: 'number', description: 'Saldo después de la transacción' },
    routeId:          { type: 'string', description: 'ID de la ruta (puede venir populado con { name })' },
    driverId:         { type: 'string', description: 'ID del conductor' },
    tripId:           { type: 'string', nullable: true, description: 'ID del viaje (opcional)' },
    fareType:         { type: 'string', description: 'Tipo de tarifa aplicada (general, estudiante, etc.)' },
    originalFare:     { type: 'number', description: 'Tarifa original antes de descuento' },
    discountApplied:  { type: 'number', description: 'Monto de descuento aplicado' },
    cardUid:          { type: 'string', nullable: true, description: 'UID de la tarjeta NFC usada (solo para NFC)' },
    createdAt:        { type: 'string', format: 'date-time' },
    updatedAt:        { type: 'string', format: 'date-time' },
  },
} as const;

const errorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error:   { type: 'string', description: 'Código o mensaje de error' },
  },
} as const;

// ── Rutas ──────────────────────────────────────────────────────────────

export async function abordajeRoutes(fastify: FastifyInstance) {

  // ─────────────────────────────────────────────────────────────────────
  // 1. POST /api/abordaje/pagar-nfc  —  Solo Conductor
  // ─────────────────────────────────────────────────────────────────────
  fastify.post('/pagar-nfc', {
    schema: {
      tags: ['Abordaje'],
      summary: 'Pagar pasaje con tarjeta NFC',
      description:
        'El conductor registra el cobro de un pasaje mediante la lectura de la tarjeta NFC del pasajero. '
        + 'Se descuenta el saldo del pasajero, se acredita al conductor y se registran dos transacciones atómicas. '
        + 'Si el pasajero tiene un perfil de descuento aprobado, se aplica automáticamente.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['cardUid', 'routeId'],
        properties: {
          cardUid: { type: 'string', minLength: 1, description: 'UID de la tarjeta NFC del pasajero', example: 'A1B2C3D4' },
          routeId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID de la ruta (ObjectId)', example: '6650a1b2c3d4e5f6a7b8c9d0' },
          tripId:  { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID del viaje activo (opcional)', nullable: true },
        },
      },
      response: {
        200: {
          description: 'Pago con NFC procesado exitosamente',
          type: 'object',
          properties: {
            approved:   { type: 'boolean', example: true },
            fare:       { type: 'number', description: 'Tarifa final cobrada (con descuento aplicado)', example: 250 },
            discount:   { type: 'number', description: 'Monto de descuento aplicado', example: 0 },
            newBalance: { type: 'number', description: 'Nuevo saldo del pasajero', example: 4750 },
            profile:    { type: 'string', description: 'Tipo de perfil de descuento aplicado', example: 'general' },
          },
        },
        400: {
          description: 'Error de validación o pago rechazado (tarjeta inválida, saldo insuficiente, tarifa no encontrada)',
          type: 'object',
          properties: {
            approved: { type: 'boolean', example: false },
            reason:   { type: 'string', description: 'Código de error: DRIVER_NOT_FOUND | CARD_NOT_FOUND_OR_BLOCKED | USER_NOT_FOUND | FARE_NOT_FOUND | INSUFFICIENT_BALANCE', example: 'INSUFFICIENT_BALANCE' },
          },
        },
      },
    },
    preHandler: [isAuth, requireRole(['driver'])],
  }, pagarNfcController);

  // ─────────────────────────────────────────────────────────────────────
  // 2. POST /api/abordaje/generar-qr  —  Solo Conductor
  // ─────────────────────────────────────────────────────────────────────
  fastify.post('/generar-qr', {
    schema: {
      tags: ['Abordaje'],
      summary: 'Generar código QR de cobro',
      description:
        'El conductor genera un código QR temporal (JWT con 15 min de vigencia) que el pasajero escanea '
        + 'desde la app móvil para pagar el pasaje. Requiere que el conductor tenga un método de pago configurado.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['routeId'],
        properties: {
          routeId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID de la ruta (ObjectId)', example: '6650a1b2c3d4e5f6a7b8c9d0' },
          tripId:  { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID del viaje activo (opcional)', nullable: true },
        },
      },
      response: {
        200: {
          description: 'Código QR generado exitosamente',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                qrToken:            { type: 'string', description: 'Token JWT que codifica la información de cobro (expira en 15 min)' },
                qrPayload:          { type: 'string', description: 'URI completa con formato suba://pay?token=...&route=...&driver=...', example: 'suba://pay?token=eyJhbGciOiJIUzI1NiJ9...&route=6650a1...&driver=6650b2...' },
                expiresAt:          { type: 'string', format: 'date-time', description: 'Fecha y hora de expiración del QR' },
                driverPaymentInfo:  { type: 'object', description: 'Información del método de pago del conductor' },
              },
            },
          },
        },
        400: {
          description: 'El conductor no tiene un método de pago configurado',
          ...errorSchema,
        },
        500: {
          description: 'Error interno al generar el código QR',
          ...errorSchema,
        },
      },
    },
    preHandler: [isAuth, requireRole(['driver'])],
  }, generarQrController);

  // ─────────────────────────────────────────────────────────────────────
  // 3. POST /api/abordaje/pagar-qr  —  Solo Pasajero
  // ─────────────────────────────────────────────────────────────────────
  fastify.post('/pagar-qr', {
    schema: {
      tags: ['Abordaje'],
      summary: 'Pagar pasaje con código QR',
      description:
        'El pasajero escanea el código QR generado por el conductor y paga el pasaje desde su saldo de billetera. '
        + 'Requiere perfil completo (isProfileComplete). Se aplican descuentos automáticos si el pasajero tiene uno aprobado.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['qrToken'],
        properties: {
          qrToken: { type: 'string', minLength: 1, description: 'Token JWT obtenido del código QR generado por el conductor' },
        },
      },
      response: {
        200: {
          description: 'Pago con QR procesado exitosamente',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                approved:   { type: 'boolean', example: true },
                fare:       { type: 'number', description: 'Tarifa final cobrada (con descuento aplicado)', example: 250 },
                newBalance: { type: 'number', description: 'Nuevo saldo del pasajero', example: 4750 },
              },
            },
          },
        },
        400: {
          description: 'Error de validación o pago rechazado (QR expirado/inválido, perfil incompleto, saldo insuficiente, conductor no encontrado, tarifa no encontrada)',
          ...errorSchema,
        },
      },
    },
    preHandler: [isAuth, requireRole(['passenger'])],
  }, pagarQrController);

  // ─────────────────────────────────────────────────────────────────────
  // 4. GET /api/abordaje/historial  —  Solo Pasajero
  // ─────────────────────────────────────────────────────────────────────
  fastify.get('/historial', {
    schema: {
      tags: ['Abordaje'],
      summary: 'Historial de abordajes del pasajero',
      description:
        'Devuelve los últimos 50 pagos de pasaje realizados por el pasajero autenticado, '
        + 'ordenados del más reciente al más antiguo. Incluye pagos por NFC, QR y móvil. '
        + 'Los campos routeId y driverId se populan con el nombre de la ruta y el conductor.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Historial de abordajes obtenido exitosamente',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: transactionSchema,
              description: 'Lista de transacciones de pago de pasaje del pasajero',
            },
          },
        },
        500: {
          description: 'Error interno al obtener el historial',
          ...errorSchema,
        },
      },
    },
    preHandler: [isAuth, requireRole(['passenger'])],
  }, getHistorialController);

  // ─────────────────────────────────────────────────────────────────────
  // 5. GET /api/abordaje/conductor/registro  —  Solo Conductor
  // ─────────────────────────────────────────────────────────────────────
  fastify.get('/conductor/registro', {
    schema: {
      tags: ['Abordaje'],
      summary: 'Registro de cobros del conductor',
      description:
        'Devuelve los últimos 100 pasajes cobrados por el conductor autenticado, '
        + 'ordenados del más reciente al más antiguo. El campo routeId se popula con el nombre de la ruta.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Registro de cobros obtenido exitosamente',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: transactionSchema,
              description: 'Lista de transacciones de cobro de pasaje del conductor',
            },
          },
        },
        500: {
          description: 'Error interno al obtener el registro',
          ...errorSchema,
        },
      },
    },
    preHandler: [isAuth, requireRole(['driver'])],
  }, conductorRegistroController);

}