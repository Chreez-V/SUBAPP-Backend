import { FastifyInstance } from 'fastify'
import { getSaldo } from '../../controllers/wallet/getSaldo.controller.js'
import { recargarSaldo } from '../../controllers/wallet/recargarSaldo.controller.js'
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js'
import { getPaymentValidationsController } from '../../controllers/wallet/getValidations.controller.js'
import { getPaymentValidationController } from '../../controllers/wallet/getValidation.controller.js'
import { approveRechargeController } from '../../controllers/wallet/approveRecharge.controller.js'
import { rejectRechargeController } from '../../controllers/wallet/rejectRecharge.controller.js'
import { rejectPaymentSchema } from '../../validators/wallet.schema.js'
import { transferirSaldo } from '../../controllers/wallet/transferirSaldo.js'
import { obtenerHistorial } from '../../controllers/wallet/historial.controller.js'
import { conductorSaldo } from '../../controllers/wallet/conductorSaldo.controller.js'
import { conductorHistorial } from '../../controllers/wallet/conductorHistorial.controller.js'
import { retirarSaldo } from '../../controllers/wallet/retirarSaldo.controller.js'
import isAuth from '../../middlewares/isAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

export async function walletRoutes(fastify: FastifyInstance) {
  // 1. Creamos el middleware
  const authenticate = createJwtMiddleware(fastify)

  // 2. Usamos 'authenticate' como preHandler para proteger las rutas de billetera
  fastify.addHook('preHandler', authenticate)

  // ==========================================
  // RUTAS DEL PASAJERO
  // ==========================================

  // Endpoint: GET /api/billetera/saldo
  fastify.get('/saldo', {
    schema: {
      tags: ['Billetera'],
      summary: 'Consultar saldo',
      description: 'Devuelve el saldo actual del usuario autenticado (pasajero o conductor).',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: { saldo: { type: 'number' } },
            },
          },
        },
      },
    },
  }, getSaldo)

  // Endpoint: POST /api/billetera/recargar
  fastify.post('/recargar', {
    schema: {
      tags: ['Billetera'],
      summary: 'Solicitar recarga de saldo',
      description: 'Registra una solicitud de recarga que queda pendiente de aprobación por un administrador. Solo pasajeros.',
      security: [{ bearerAuth: [] }],
    },
  }, recargarSaldo)

  // Endpoint: POST /api/billetera/transferir
  fastify.post('/transferir', {
    schema: {
      tags: ['Billetera'],
      summary: 'Transferir saldo a otro usuario',
      description: 'Permite a un pasajero transferir saldo a otro usuario registrado mediante su email.',
      security: [{ bearerAuth: [] }],
    },
  }, transferirSaldo)

  // Endpoint: GET /api/billetera/historial
  fastify.get('/historial', {
    schema: {
      tags: ['Billetera'],
      summary: 'Historial de transacciones del pasajero',
      description: 'Devuelve el historial paginado de transacciones del usuario autenticado.',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string', description: 'Número de página (default: 1)' },
          limit: { type: 'string', description: 'Resultados por página (default: 10)' },
        },
      },
    },
  }, obtenerHistorial)

  // ==========================================
  // RUTAS DE VALIDACIÓN DE RECARGAS (ADMIN)
  // ==========================================

  fastify.get('/validaciones', {
    schema: {
      tags: ['Billetera'],
      summary: 'Listar validaciones de recarga',
      description: 'Devuelve todas las solicitudes de recarga pendientes de validación. Requiere rol admin.',
      security: [{ bearerAuth: [] }],
    },
  }, getPaymentValidationsController)

  fastify.get('/validaciones/:id', {
    schema: {
      tags: ['Billetera'],
      summary: 'Obtener validación de recarga por ID',
      description: 'Devuelve el detalle de una solicitud de recarga específica.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de la validación (ObjectId)' } },
      },
    },
  }, getPaymentValidationController)

  fastify.put('/validaciones/:id/aprobar', {
    schema: {
      tags: ['Billetera'],
      summary: 'Aprobar recarga de saldo',
      description: 'Aprueba una solicitud de recarga pendiente y acredita el saldo al usuario. Requiere rol admin.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de la validación (ObjectId)' } },
      },
    },
  }, approveRechargeController)

  fastify.put('/validaciones/:id/rechazar', {
    schema: {
      tags: ['Billetera'],
      summary: 'Rechazar recarga de saldo',
      description: 'Rechaza una solicitud de recarga pendiente indicando el motivo. Requiere rol admin.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de la validación (ObjectId)' } },
      },
      ...rejectPaymentSchema,
    },
  }, rejectRechargeController)

  // ==========================================
  // RUTAS DEL CONDUCTOR
  // ==========================================

  // Endpoint: GET /api/billetera/conductor/saldo
  fastify.get('/conductor/saldo', {
    preHandler: [requireRole(['driver'])],
    schema: {
      tags: ['Billetera'],
      summary: 'Consultar saldo del conductor',
      description: 'Devuelve el saldo acumulado por cobros de pasajes del conductor autenticado.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                saldo: { type: 'number' },
                conductor: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, conductorSaldo)

  // Endpoint: GET /api/billetera/conductor/historial
  fastify.get('/conductor/historial', {
    preHandler: [requireRole(['driver'])],
    schema: {
      tags: ['Billetera'],
      summary: 'Historial de transacciones del conductor',
      description: 'Devuelve el historial paginado de cobros, retiros y otras transacciones del conductor.',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string', description: 'Número de página (default: 1)' },
          limit: { type: 'string', description: 'Resultados por página (default: 20)' },
          tipo: { type: 'string', description: 'Filtrar por tipo de transacción (ej: cobro_pasaje, retiro)' },
        },
      },
    },
  }, conductorHistorial)

  // Endpoint: POST /api/billetera/retirar
  fastify.post('/retirar', {
    preHandler: [requireRole(['driver'])],
    schema: {
      tags: ['Billetera'],
      summary: 'Retirar saldo del conductor',
      description: 'Permite al conductor retirar saldo acumulado hacia su método de pago registrado. Requiere tener un método de pago configurado.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['monto'],
        properties: {
          monto: { type: 'number', minimum: 0.01, description: 'Monto a retirar (debe ser positivo)' },
          descripcion: { type: 'string', description: 'Descripción opcional del retiro' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                transaccionId: { type: 'string' },
                monto: { type: 'number' },
                saldoAnterior: { type: 'number' },
                nuevoSaldo: { type: 'number' },
                metodo: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, retirarSaldo)
}
