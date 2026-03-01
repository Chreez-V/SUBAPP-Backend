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

// Filtro de seguridad rápido para verificar si es Admin
const isAdmin = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user as { role: string };
    if (user.role !== 'admin') {
    return res.status(403).send({ message: 'Acceso denegado. Acción exclusiva para administradores.' });
    }
}

// ── Esquemas JSON reutilizables ────────────────────────────────────────

const nfcCardSchema = {
  type: 'object',
  properties: {
    _id:            { type: 'string', description: 'ID de la tarjeta (ObjectId)' },
    cardUid:        { type: 'string', description: 'UID físico de la tarjeta NFC' },
    userId:         { type: 'string', description: 'ID del pasajero propietario' },
    status:         { type: 'string', enum: ['activa', 'bloqueada', 'perdida'], description: 'Estado actual de la tarjeta' },
    blockedReason:  { type: 'string', nullable: true, description: 'Motivo de bloqueo (si aplica)' },
    requestId:      { type: 'string', nullable: true, description: 'ID de la solicitud asociada' },
    lastUsedAt:     { type: 'string', format: 'date-time', nullable: true, description: 'Última vez que se usó la tarjeta' },
    createdAt:      { type: 'string', format: 'date-time' },
    updatedAt:      { type: 'string', format: 'date-time' },
  },
} as const;

const nfcRequestSchema = {
  type: 'object',
  properties: {
    _id:              { type: 'string', description: 'ID de la solicitud (ObjectId)' },
    userId:           { type: 'string', description: 'ID del pasajero (se popula con fullName y email)' },
    status:           { type: 'string', enum: ['pendiente_pago', 'pendiente_revision', 'aprobada', 'rechazada', 'vinculada'], description: 'Estado actual de la solicitud' },
    emissionAmount:   { type: 'number', description: 'Costo de emisión de la tarjeta', example: 50 },
    rejectionReason:  { type: 'string', nullable: true, description: 'Motivo de rechazo (si fue rechazada)' },
    reviewedBy:       { type: 'string', nullable: true, description: 'ID del administrador que revisó' },
    reviewedAt:       { type: 'string', format: 'date-time', nullable: true, description: 'Fecha de revisión' },
    linkedCardUid:    { type: 'string', nullable: true, description: 'UID de la tarjeta vinculada (si ya se vinculó)' },
    linkedAt:         { type: 'string', format: 'date-time', nullable: true, description: 'Fecha de vinculación' },
    createdAt:        { type: 'string', format: 'date-time' },
    updatedAt:        { type: 'string', format: 'date-time' },
  },
} as const;

const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string', description: 'Mensaje de error' },
  },
} as const;

// ── Rutas ──────────────────────────────────────────────────────────────

export async function nfcRoutes(fastify: FastifyInstance) {

  // ==========================================
  // RUTAS DEL PASAJERO
  // ==========================================

  // POST /api/nfc/solicitar
  fastify.post('/solicitar', {
    preHandler: [isAuth],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Solicitar tarjeta NFC',
      description:
        'El pasajero inicia una solicitud de tarjeta NFC. La solicitud se crea en estado "pendiente_pago" '
        + 'con un costo de emisión de 50. No se aceptan nuevas solicitudes si el pasajero ya tiene una tarjeta activa '
        + 'o una solicitud en proceso (pendiente_pago, pendiente_revision, aprobada).',
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          description: 'Solicitud de tarjeta NFC creada exitosamente',
          type: 'object',
          properties: {
            message:   { type: 'string', example: 'Solicitud creada con éxito. Por favor, procede a registrar tu pago.' },
            solicitud: nfcRequestSchema,
          },
        },
        400: {
          description: 'El pasajero ya tiene una tarjeta activa o una solicitud en proceso',
          ...errorSchema,
        },
        401: {
          description: 'Token de autenticación inválido o ausente',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, solicitarTarjeta)

  // POST /api/nfc/pagar-tarjeta
  fastify.post('/pagar-tarjeta', {
    preHandler: [isAuth],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Registrar pago de tarjeta NFC',
      description:
        'El pasajero registra el pago de la tarjeta NFC proporcionando la referencia del pago. '
        + 'La solicitud pasa de "pendiente_pago" a "pendiente_revision" para que un administrador la apruebe.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['reference'],
        properties: {
          reference: { type: 'string', minLength: 4, description: 'Referencia del pago (mínimo 4 caracteres)', example: 'REF-2026-001234' },
        },
      },
      response: {
        200: {
          description: 'Pago registrado, en espera de revisión por un administrador',
          type: 'object',
          properties: {
            message:   { type: 'string', example: 'Pago registrado (simulado). En espera de revisión por un administrador.' },
            solicitud: nfcRequestSchema,
          },
        },
        404: {
          description: 'No hay solicitud pendiente de pago para este usuario',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, pagarTarjeta)

  // POST /api/nfc/vincular
  fastify.post('/vincular', {
    preHandler: [isAuth],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Vincular tarjeta NFC a cuenta',
      description:
        'Vincula una tarjeta NFC física (mediante su UID) a la cuenta del pasajero autenticado. '
        + 'Requiere que la solicitud esté en estado "aprobada". La tarjeta no debe estar previamente registrada. '
        + 'Tras vincular, la solicitud pasa a estado "vinculada" y la tarjeta queda activa.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['cardUid'],
        properties: {
          cardUid: { type: 'string', minLength: 4, description: 'UID físico de la tarjeta NFC leído desde el teléfono', example: 'A1B2C3D4E5F6' },
        },
      },
      response: {
        200: {
          description: 'Tarjeta vinculada exitosamente a la cuenta del pasajero',
          type: 'object',
          properties: {
            message: { type: 'string', example: '¡Tarjeta vinculada con éxito! Ya puedes usarla para pagar tus pasajes.' },
            tarjeta: nfcCardSchema,
          },
        },
        400: {
          description: 'No tiene solicitud aprobada o la tarjeta ya está registrada',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, vincularTarjeta)

  // GET /api/nfc/mi-tarjeta
  fastify.get('/mi-tarjeta', {
    preHandler: [isAuth],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Ver mi tarjeta NFC',
      description:
        'Devuelve la información de la tarjeta NFC activa vinculada al pasajero autenticado, '
        + 'incluyendo su UID, estado y fecha de último uso.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Información de la tarjeta activa del pasajero',
          type: 'object',
          properties: {
            tarjeta: nfcCardSchema,
          },
        },
        404: {
          description: 'El pasajero no posee una tarjeta activa',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, verMiTarjeta)

  // PUT /api/nfc/bloquear
  fastify.put('/bloquear', {
    preHandler: [isAuth],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Bloquear mi tarjeta NFC',
      description:
        'El pasajero puede bloquear su propia tarjeta NFC en caso de pérdida o robo. '
        + 'Una vez bloqueada, la tarjeta no podrá usarse para pagos de pasaje.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          blockedReason: { type: 'string', description: 'Motivo del bloqueo (opcional)', example: 'Tarjeta extraviada' },
        },
      },
      response: {
        200: {
          description: 'Tarjeta bloqueada exitosamente',
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Tu tarjeta ha sido bloqueada exitosamente por seguridad.' },
            tarjeta: nfcCardSchema,
          },
        },
        404: {
          description: 'No tiene tarjeta activa para bloquear',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, bloquearMiTarjeta)

  // ==========================================
  // RUTAS DEL ADMINISTRADOR
  // ==========================================

  // GET /api/nfc/solicitudes
  fastify.get('/solicitudes', {
    preHandler: [isAuth, isAdmin],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Listar solicitudes de tarjetas NFC',
      description:
        'Devuelve todas las solicitudes de tarjetas NFC registradas, ordenadas de la más reciente a la más antigua. '
        + 'Incluye datos del pasajero (fullName, email) mediante populate. Requiere rol administrador.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Lista de solicitudes de tarjetas NFC',
          type: 'object',
          properties: {
            solicitudes: {
              type: 'array',
              items: nfcRequestSchema,
              description: 'Lista de solicitudes (userId populado con fullName y email)',
            },
          },
        },
        403: {
          description: 'Acceso denegado — requiere rol administrador',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, obtenerSolicitudes)

  // GET /api/nfc/solicitudes/:id
  fastify.get('/solicitudes/:id', {
    preHandler: [isAuth, isAdmin],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Obtener solicitud de tarjeta NFC por ID',
      description: 'Devuelve el detalle completo de una solicitud de tarjeta NFC específica. El campo userId viene populado con fullName y email. Requiere rol administrador.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID de la solicitud (ObjectId)' } },
      },
      response: {
        200: {
          description: 'Detalle de la solicitud',
          type: 'object',
          properties: {
            solicitud: nfcRequestSchema,
          },
        },
        404: {
          description: 'Solicitud no encontrada',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, obtenerSolicitudPorId)

  // PUT /api/nfc/solicitudes/:id/aprobar
  fastify.put('/solicitudes/:id/aprobar', {
    preHandler: [isAuth, isAdmin],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Aprobar solicitud de tarjeta NFC',
      description:
        'Aprueba una solicitud de tarjeta NFC que esté en estado "pendiente_revision". '
        + 'Solo se puede aprobar solicitudes en ese estado. Registra qué administrador aprobó y la fecha. '
        + 'El pasajero podrá vincular su tarjeta física después de la aprobación.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID de la solicitud (ObjectId)' } },
      },
      response: {
        200: {
          description: 'Solicitud aprobada exitosamente',
          type: 'object',
          properties: {
            message:   { type: 'string', example: 'Solicitud aprobada exitosamente.' },
            solicitud: nfcRequestSchema,
          },
        },
        400: {
          description: 'La solicitud no está en estado pendiente_revision',
          ...errorSchema,
        },
        404: {
          description: 'Solicitud no encontrada',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, aprobarSolicitud)

  // PUT /api/nfc/solicitudes/:id/rechazar
  fastify.put('/solicitudes/:id/rechazar', {
    preHandler: [isAuth, isAdmin],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Rechazar solicitud de tarjeta NFC',
      description:
        'Rechaza una solicitud de tarjeta NFC indicando el motivo. '
        + 'La solicitud pasa a estado "rechazada" y se registra el administrador que la rechazó.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID de la solicitud (ObjectId)' } },
      },
      body: {
        type: 'object',
        required: ['rejectionReason'],
        properties: {
          rejectionReason: { type: 'string', minLength: 5, description: 'Motivo del rechazo (mínimo 5 caracteres)', example: 'Referencia de pago no verificable' },
        },
      },
      response: {
        200: {
          description: 'Solicitud rechazada',
          type: 'object',
          properties: {
            message:   { type: 'string', example: 'Solicitud rechazada.' },
            solicitud: nfcRequestSchema,
          },
        },
        404: {
          description: 'Solicitud no encontrada',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, rechazarSolicitud)

  // PUT /api/nfc/admin/bloquear/:cardUid
  fastify.put('/admin/bloquear/:cardUid', {
    preHandler: [isAuth, isAdmin],
    schema: {
      tags: ['Tarjetas NFC'],
      summary: 'Bloquear tarjeta NFC (admin)',
      description:
        'El administrador puede bloquear cualquier tarjeta NFC activa del sistema mediante su UID. '
        + 'Útil para casos de fraude o reportes de seguridad.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['cardUid'],
        properties: { cardUid: { type: 'string', description: 'UID físico de la tarjeta NFC a bloquear', example: 'A1B2C3D4E5F6' } },
      },
      body: {
        type: 'object',
        properties: {
          blockedReason: { type: 'string', description: 'Motivo del bloqueo (opcional)', example: 'Reporte de uso fraudulento' },
        },
      },
      response: {
        200: {
          description: 'Tarjeta bloqueada exitosamente por el administrador',
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Tarjeta bloqueada exitosamente por el administrador.' },
            tarjeta: nfcCardSchema,
          },
        },
        404: {
          description: 'No se encontró una tarjeta activa con ese UID',
          ...errorSchema,
        },
        500: {
          description: 'Error interno del servidor',
          ...errorSchema,
        },
      },
    },
  }, bloquearTarjetaAdmin)

}