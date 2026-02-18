import { FastifyInstance } from 'fastify';
import {
  getAllRouteSets,
  getRouteSetById,
  createRouteSet,
  updateRouteSet,
  addRouteToSet,
  removeRouteFromSet,
  setActiveRouteInSet,
  deleteRouteSet,
} from '../controllers/routeSets.controller.js';

export async function routeSetsRoutes(fastify: FastifyInstance) {
  // GET - List all route sets
  fastify.get('/conjuntos', {
    schema: {
      description: 'Retorna todos los conjuntos de rutas. Un conjunto agrupa rutas alternativas donde solo una puede estar activa a la vez.',
      summary: 'Listar todos los conjuntos',
      tags: ['Conjuntos'],
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
  }, getAllRouteSets);

  // GET - Get route set by ID
  fastify.get('/conjuntos/buscar/:id', {
    schema: {
      description: 'Retorna un conjunto de rutas específico con sus rutas pobladas.',
      summary: 'Obtener conjunto por ID',
      tags: ['Conjuntos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del conjunto (MongoDB ObjectId)' },
        },
      },
    },
  }, getRouteSetById);

  // POST - Create a new route set
  fastify.post('/conjuntos/crear', {
    schema: {
      description: 'Crea un nuevo conjunto de rutas. Opcionalmente puede incluir IDs de rutas existentes para agregar al conjunto.',
      summary: 'Crear conjunto de rutas',
      tags: ['Conjuntos'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'Nombre del conjunto (ej: "UNEG Atlántico")' },
          description: { type: 'string', description: 'Descripción opcional del conjunto' },
          routeIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs de rutas para agregar al conjunto (opcional)',
          },
        },
      },
    },
  }, createRouteSet);

  // PATCH - Update a route set
  fastify.patch('/conjuntos/actualizar/:id', {
    schema: {
      description: 'Actualiza el nombre, descripción o estado de un conjunto de rutas.',
      summary: 'Actualizar conjunto',
      tags: ['Conjuntos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del conjunto' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nuevo nombre' },
          description: { type: 'string', description: 'Nueva descripción' },
          isActive: { type: 'boolean', description: 'Estado activo/inactivo' },
        },
      },
    },
  }, updateRouteSet);

  // POST - Add a route to a set
  fastify.post('/conjuntos/:id/agregar-ruta', {
    schema: {
      description: 'Agrega una ruta existente al conjunto. Si es la primera ruta, se establece como la ruta activa automáticamente.',
      summary: 'Agregar ruta al conjunto',
      tags: ['Conjuntos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del conjunto' },
        },
      },
      body: {
        type: 'object',
        required: ['routeId'],
        properties: {
          routeId: { type: 'string', description: 'ID de la ruta a agregar' },
        },
      },
    },
  }, addRouteToSet);

  // POST - Remove a route from a set
  fastify.post('/conjuntos/:id/quitar-ruta', {
    schema: {
      description: 'Remueve una ruta del conjunto. Si la ruta removida era la activa, se limpia la ruta activa.',
      summary: 'Quitar ruta del conjunto',
      tags: ['Conjuntos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del conjunto' },
        },
      },
      body: {
        type: 'object',
        required: ['routeId'],
        properties: {
          routeId: { type: 'string', description: 'ID de la ruta a remover' },
        },
      },
    },
  }, removeRouteFromSet);

  // POST - Set which route is active in the set
  fastify.post('/conjuntos/:id/activar-ruta', {
    schema: {
      description: 'Cambia la ruta activa dentro del conjunto. Desactiva la ruta actualmente activa y activa la nueva. Solo una ruta puede estar activa por conjunto.',
      summary: 'Activar ruta del conjunto',
      tags: ['Conjuntos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del conjunto' },
        },
      },
      body: {
        type: 'object',
        required: ['routeId'],
        properties: {
          routeId: { type: 'string', description: 'ID de la ruta a activar' },
        },
      },
    },
  }, setActiveRouteInSet);

  // DELETE - Permanently delete a route set
  fastify.delete('/conjuntos/eliminar/:id', {
    schema: {
      description: 'Elimina permanentemente un conjunto de rutas. Las rutas contenidas no se eliminan, solo se desvinculan.',
      summary: 'Eliminar conjunto permanentemente',
      tags: ['Conjuntos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del conjunto' },
        },
      },
    },
  }, deleteRouteSet);
}
