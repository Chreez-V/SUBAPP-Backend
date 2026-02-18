import { FastifyInstance } from 'fastify';
import {
  getAllStops,
  getActiveStops,
  getStopById,
  createStop,
  updateStop,
  deactivateStop,
  permanentDeleteStop,
} from '../controllers/stops.controller.js';

export async function stopsRoutes(fastify: FastifyInstance) {
  // GET - All stops
  fastify.get('/paradas', {
    schema: {
      description: 'Retorna todas las paradas del sistema.',
      summary: 'Listar todas las paradas',
      tags: ['Paradas'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: { type: 'array' },
          },
        },
      },
    },
  }, getAllStops);

  // GET - Active stops only
  fastify.get('/paradas/activas', {
    schema: {
      description: 'Retorna únicamente las paradas activas.',
      summary: 'Listar paradas activas',
      tags: ['Paradas'],
    },
  }, getActiveStops);

  // GET - Stop by ID
  fastify.get('/paradas/buscar/:id', {
    schema: {
      description: 'Buscar una parada por su ID.',
      summary: 'Obtener parada por ID',
      tags: ['Paradas'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
      },
    },
  }, getStopById);

  // POST - Create stop
  fastify.post('/paradas/crear', {
    schema: {
      description: 'Crea una nueva parada en el mapa.',
      summary: 'Crear parada',
      tags: ['Paradas'],
      body: {
        type: 'object',
        required: ['name', 'location'],
        properties: {
          name: { type: 'string', description: 'Nombre de la parada' },
          description: { type: 'string', description: 'Descripción opcional' },
          location: {
            type: 'object',
            required: ['lat', 'lng'],
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
            },
          },
          address: { type: 'string', description: 'Dirección (opcional)' },
          referenceLabel: { type: 'string', description: 'Referencia para la app SUBA' },
        },
      },
    },
  }, createStop);

  // PATCH - Update stop
  fastify.patch('/paradas/actualizar/:id', {
    schema: {
      description: 'Actualiza una parada existente.',
      summary: 'Actualizar parada',
      tags: ['Paradas'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          address: { type: 'string' },
          referenceLabel: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
    },
  }, updateStop);

  // DELETE - Soft delete
  fastify.delete('/paradas/desactivar/:id', {
    schema: {
      description: 'Desactiva una parada (eliminación lógica).',
      summary: 'Desactivar parada',
      tags: ['Paradas'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
      },
    },
  }, deactivateStop);

  // DELETE - Hard delete
  fastify.delete('/paradas/eliminar/:id', {
    schema: {
      description: 'Elimina permanentemente una parada.',
      summary: 'Eliminar parada permanentemente',
      tags: ['Paradas'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
      },
    },
  }, permanentDeleteStop);
}
