import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import isAuth from '../../middlewares/isAuth.js'

// Controladores del Pasajero
import {
    solicitarTarjeta,
    pagarTarjeta,
    vincularTarjeta,
    verMiTarjeta,
    bloquearMiTarjeta
} from '../../controllers/nfc/passengerNfc.controller.js'

// Controladores del Administrador
import {
    obtenerSolicitudes,
    obtenerSolicitudPorId,
    aprobarSolicitud,
    rechazarSolicitud,
    bloquearTarjetaAdmin
} from '../../controllers/nfc/adminNfc.controller.js'

// Validadores Zod
import {
    payNfcRequestSchema,
    linkNfcCardSchema,
    blockNfcCardSchema,
    rejectNfcRequestSchema
} from '../../validators/nfc.schema.js'

// Filtro de seguridad rápido para verificar si es Admin
const isAdmin = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user as { role: string };
    if (user.role !== 'admin') {
    return res.status(403).send({ message: 'Acceso denegado. Acción exclusiva para administradores.' });
    }
}

export async function nfcRoutes(fastify: FastifyInstance) {

  // ==========================================
  // RUTAS DEL PASAJERO
  // ==========================================

  fastify.post('/solicitar', {
    preHandler: [isAuth],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Solicitar tarjeta NFC',
      description: 'El pasajero solicita una tarjeta NFC para usar en el transporte. La solicitud queda pendiente de aprobación por un administrador.',
      security: [{ bearerAuth: [] }],
    },
  }, solicitarTarjeta)

  fastify.post('/pagar-tarjeta', {
    preHandler: [isAuth],
    schema: {
      ...payNfcRequestSchema,
      tags: ['Tarjetas NFC'],
      summary: 'Registrar pago de tarjeta NFC',
      description: 'El pasajero registra el pago de la tarjeta NFC con referencia de pago. Queda pendiente de validación.',
      security: [{ bearerAuth: [] }],
    },
  }, pagarTarjeta)

  fastify.post('/vincular', {
    preHandler: [isAuth],
    schema: {
      ...linkNfcCardSchema,
      tags: ['Tarjetas NFC'],
      summary: 'Vincular tarjeta NFC a cuenta',
      description: 'Vincula una tarjeta NFC física (mediante su UID) a la cuenta del pasajero autenticado.',
      security: [{ bearerAuth: [] }],
    },
  }, vincularTarjeta)

  fastify.get('/mi-tarjeta', {
    preHandler: [isAuth],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Ver mi tarjeta NFC',
      description: 'Devuelve la información de la tarjeta NFC vinculada al pasajero autenticado, incluyendo estado y datos de la solicitud.',
      security: [{ bearerAuth: [] }],
    },
  }, verMiTarjeta)

  fastify.put('/bloquear', {
    preHandler: [isAuth],
    schema: {
      ...blockNfcCardSchema,
      tags: ['Tarjetas NFC'],
      summary: 'Bloquear mi tarjeta NFC',
      description: 'El pasajero puede bloquear su propia tarjeta NFC en caso de pérdida o robo.',
      security: [{ bearerAuth: [] }],
    },
  }, bloquearMiTarjeta)

  // ==========================================
  // RUTAS DEL ADMINISTRADOR
  // ==========================================

  fastify.get('/solicitudes', {
    preHandler: [isAuth, isAdmin],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Listar solicitudes de tarjetas NFC',
      description: 'Devuelve todas las solicitudes de tarjetas NFC registradas en el sistema. Requiere rol administrador.',
      security: [{ bearerAuth: [] }],
    },
  }, obtenerSolicitudes)

  fastify.get('/solicitudes/:id', {
    preHandler: [isAuth, isAdmin],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Obtener solicitud de tarjeta NFC por ID',
      description: 'Devuelve el detalle de una solicitud de tarjeta NFC específica. Requiere rol administrador.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de la solicitud (ObjectId)' } },
      },
    },
  }, obtenerSolicitudPorId)

  fastify.put('/solicitudes/:id/aprobar', {
    preHandler: [isAuth, isAdmin],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Aprobar solicitud de tarjeta NFC',
      description: 'Aprueba una solicitud pendiente de tarjeta NFC. El pasajero podrá vincular su tarjeta después de la aprobación.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de la solicitud (ObjectId)' } },
      },
    },
  }, aprobarSolicitud)

  fastify.put('/solicitudes/:id/rechazar', {
    preHandler: [isAuth, isAdmin],
    schema: {
      ...rejectNfcRequestSchema,
      tags: ['Tarjetas NFC'],
      summary: 'Rechazar solicitud de tarjeta NFC',
      description: 'Rechaza una solicitud pendiente de tarjeta NFC indicando el motivo del rechazo.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de la solicitud (ObjectId)' } },
      },
    },
  }, rechazarSolicitud)

  fastify.put('/admin/bloquear/:cardUid', {
    preHandler: [isAuth, isAdmin],
    schema: {
      ...blockNfcCardSchema,
      tags: ['Tarjetas NFC'],
      summary: 'Bloquear tarjeta NFC (admin)',
      description: 'El administrador puede bloquear cualquier tarjeta NFC del sistema mediante su UID.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { cardUid: { type: 'string', description: 'UID de la tarjeta NFC a bloquear' } },
      },
    },
  }, bloquearTarjetaAdmin)

}