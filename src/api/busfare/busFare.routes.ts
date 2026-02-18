import { FastifyInstance } from 'fastify';
import { getBusFaresController } from '../../controllers/busfare/getBusFares.controller.js';
import { createBusFareController } from '../../controllers/busfare/createBusFares.controller.js';
import { updateBusFareController } from '../../controllers/busfare/updateBusFares.controller.js';
import { deleteBusFareController } from '../../controllers/busfare/deleteBusFares.controller.js';

export async function busFareRoutes(fastify: FastifyInstance) {
  // GET /busfares
  fastify.get('/listar', {
    schema: {
      tags: ['Pasaje'],
      summary: 'Listar todas las tarifas',
      description: 'Retorna la lista completa de tarifas de pasaje configuradas en el sistema.',
      response: {
        200: {
          description: 'Lista de tarifas obtenida exitosamente',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              amount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, getBusFaresController);

  // POST /busfares
  fastify.post('/crear', {
    schema: {
      tags: ['Pasaje'],
      summary: 'Crear nueva tarifa',
      description: 'Crea una nueva tarifa de pasaje con el monto especificado.',
      body: {
        type: 'object',
        required: ['fare'],
        properties: {
          routeId: { type: 'string', description: 'ID de la ruta asociada' },
          fare: { type: 'number', description: 'Monto de la tarifa en la moneda local' }
        }
      },
      response: {
        201: {
          description: 'Tarifa creada exitosamente',
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fare: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, createBusFareController);

  // PUT /busfares/:id
  fastify.put('/actualizar/:id', {
    schema: {
      tags: ['Pasaje'],
      summary: 'Actualizar tarifa',
      description: 'Actualiza el monto de una tarifa de pasaje existente por su ID.',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID de la tarifa (MongoDB ObjectId)' }
        }
      },
      body: {
        type: 'object',
        required: ['fare'],
        properties: {
          fare: { type: 'number', description: 'Nuevo monto de la tarifa' }
        }
      },
      response: {
        200: {
          description: 'Tarifa actualizada exitosamente',
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fare: { type: 'number' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          description: 'Tarifa no encontrada',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, updateBusFareController);

  // DELETE /busfares/:id
  fastify.delete('/eliminar/:id', {
    schema: {
      tags: ['Pasaje'],
      summary: 'Eliminar tarifa',
      description: 'Elimina permanentemente una tarifa de pasaje específica por su ID.',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID de la tarifa (MongoDB ObjectId)' }
        }
      },
      response: {
        200: {
          description: 'Tarifa eliminada exitosamente',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        404: {
          description: 'Tarifa no encontrada',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, deleteBusFareController);
}