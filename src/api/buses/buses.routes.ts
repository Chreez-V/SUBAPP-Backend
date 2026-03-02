import { FastifyInstance } from 'fastify'
import { listarBuses } from '../../controllers/buses/listarBuses.controller.js'
import { obtenerBus } from '../../controllers/buses/obtenerBus.controller.js'
import { crearBus } from '../../controllers/buses/crearBus.controller.js'
import { actualizarBus } from '../../controllers/buses/actualizarBus.controller.js'
import { eliminarBus } from '../../controllers/buses/eliminarBus.controller.js'
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'

const busResponseSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    placa: { type: 'string' },
    marca: { type: 'string' },
    modelo: { type: 'string' },
    anio: { type: 'number' },
    capacidad: { type: 'number' },
    status: { type: 'string' },
    assignedRouteId: { type: 'object', nullable: true },
    assignedDriverId: { type: 'object', nullable: true },
    color: { type: 'string' },
    numeroInterno: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
}

export async function busRoutes(fastify: FastifyInstance) {
  const authenticate = createJwtMiddleware(fastify)

  // GET /api/autobuses — Listar todos los autobuses
  fastify.get('/', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Autobuses'],
      summary: 'Listar todos los autobuses',
      description: 'Retorna la lista completa de autobuses registrados. Se puede filtrar por status usando query param.',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['Activo', 'Inactivo', 'Mantenimiento'], description: 'Filtrar por estado del autobús' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: { type: 'array', items: busResponseSchema },
          },
        },
      },
    },
  }, listarBuses)

  // GET /api/autobuses/:id — Obtener autobús por ID
  fastify.get('/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Autobuses'],
      summary: 'Obtener autobús por ID',
      description: 'Retorna los datos completos de un autobús específico, incluyendo la ruta y conductor asignados.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', description: 'ID del autobús (ObjectId)' } },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: busResponseSchema,
          },
        },
      },
    },
  }, obtenerBus)

  // POST /api/autobuses — Crear nuevo autobús
  fastify.post('/', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Autobuses'],
      summary: 'Registrar nuevo autobús',
      description: 'Crea un nuevo registro de autobús en el sistema. La placa debe ser única.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['placa', 'marca', 'modelo', 'anio', 'capacidad'],
        properties: {
          placa: { type: 'string', description: 'Placa del autobús (única, se guarda en mayúsculas)' },
          marca: { type: 'string', description: 'Marca del autobús (ej: Mercedes-Benz)' },
          modelo: { type: 'string', description: 'Modelo del autobús (ej: OF-1721)' },
          anio: { type: 'number', description: 'Año de fabricación' },
          capacidad: { type: 'number', description: 'Capacidad máxima de pasajeros' },
          status: { type: 'string', enum: ['Activo', 'Inactivo', 'Mantenimiento'], description: 'Estado inicial (default: Activo)' },
          assignedRouteId: { type: 'string', description: 'ID de la ruta asignada (ObjectId)' },
          assignedDriverId: { type: 'string', description: 'ID del conductor asignado (ObjectId)' },
          color: { type: 'string', description: 'Color del autobús' },
          numeroInterno: { type: 'string', description: 'Número interno de la flota' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: busResponseSchema,
          },
        },
      },
    },
  }, crearBus)

  // PUT /api/autobuses/:id — Actualizar autobús
  fastify.put('/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Autobuses'],
      summary: 'Actualizar autobús',
      description: 'Actualiza los datos de un autobús existente. Solo se modifican los campos enviados.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', description: 'ID del autobús (ObjectId)' } },
      },
      body: {
        type: 'object',
        properties: {
          placa: { type: 'string' },
          marca: { type: 'string' },
          modelo: { type: 'string' },
          anio: { type: 'number' },
          capacidad: { type: 'number' },
          status: { type: 'string', enum: ['Activo', 'Inactivo', 'Mantenimiento'] },
          assignedRouteId: { type: 'string', nullable: true },
          assignedDriverId: { type: 'string', nullable: true },
          color: { type: 'string' },
          numeroInterno: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: busResponseSchema,
          },
        },
      },
    },
  }, actualizarBus)

  // DELETE /api/autobuses/:id — Eliminar autobús
  fastify.delete('/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Autobuses'],
      summary: 'Eliminar autobús',
      description: 'Elimina permanentemente un autobús del sistema.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', description: 'ID del autobús (ObjectId)' } },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, eliminarBus)
}
