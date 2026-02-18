import { FastifyInstance } from 'fastify';
import {
  getAllRoutes,
  getActiveRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  permanentDeleteRoute,
} from '../controllers/routes.controller.js';

export async function routesRoutes(fastify: FastifyInstance) {
  
  // GET - Get all routes
  fastify.get('/rutas', {
    schema: {
      description: 'Retorna todas las rutas del sistema, incluyendo activas e inactivas.',
      summary: 'Listar todas las rutas',
      tags: ['Rutas'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: { type: 'array' }
          }
        }
      }
    }
  }, getAllRoutes);

  // GET - Get only active routes
  fastify.get('/rutas/activas', {
    schema: {
      description: 'Retorna únicamente las rutas con estado activo disponibles para asignación de viajes.',
      summary: 'Listar rutas activas',
      tags: ['Rutas'],
    }
  }, getActiveRoutes);

  // GET - Get route by ID
  fastify.get('/rutas/buscar/:id', {
    schema: {
      description: 'Retorna los datos completos de una ruta específica buscada por su ID de MongoDB.',
      summary: 'Obtener ruta por ID',
      tags: ['Rutas'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la ruta (MongoDB ObjectId)' }
        }
      }
    }
  }, getRouteById);

  // POST - Create new route
  fastify.post('/rutas/crear', {
    schema: {
      description: 'Crea una nueva ruta de transporte usando OSRM para calcular el trazado entre el punto de inicio y el punto de destino.',
      summary: 'Crear ruta',
      tags: ['Rutas'],
      body: {
        type: 'object',
        required: ['name', 'startPoint', 'endPoint'],
        properties: {
          name: { type: 'string', description: 'Nombre identificador de la ruta' },
          startPoint: {
            type: 'object',
            description: 'Coordenadas del punto de inicio',
            required: ['lat', 'lng'],
            properties: {
              lat: { type: 'number', description: 'Latitud del punto de inicio' },
              lng: { type: 'number', description: 'Longitud del punto de inicio' }
            }
          },
          endPoint: {
            type: 'object',
            description: 'Coordenadas del punto de destino',
            required: ['lat', 'lng'],
            properties: {
              lat: { type: 'number', description: 'Latitud del punto de destino' },
              lng: { type: 'number', description: 'Longitud del punto de destino' }
            }
          },
          fare: { type: 'number', description: 'Tarifa de la ruta (opcional)' },
          schedules: { 
            type: 'array',
            description: 'Horarios de la ruta (opcional)',
            items: { type: 'string' }
          }
        }
      }
    }
  }, createRoute);

  // PATCH - Update a route
  fastify.patch('/rutas/actualizar/:id', {
    schema: {
      description: 'Actualiza los campos de una ruta existente. Solo se modifican los campos enviados en el cuerpo.',
      summary: 'Actualizar ruta',
      tags: ['Rutas'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la ruta (MongoDB ObjectId)' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nuevo nombre de la ruta' },
          fare: { type: 'number', description: 'Nueva tarifa' },
          isActive: { type: 'boolean', description: 'Estado de la ruta (activa/inactiva)' },
          schedules: { 
            type: 'array',
            description: 'Nuevos horarios',
            items: { type: 'string' }
          }
        }
      }
    }
  }, updateRoute);

  // DELETE - Deactivate route (soft delete)
  fastify.delete('/rutas/desactivar/:id', {
    schema: {
      description: 'Desactiva una ruta marcándola como inactiva (eliminación lógica). La ruta sigue en la base de datos pero no aparece como disponible.',
      summary: 'Desactivar ruta',
      tags: ['Rutas'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la ruta (MongoDB ObjectId)' }
        }
      }
    }
  }, deleteRoute);

  // DELETE - Permanently delete
  fastify.delete('/rutas/eliminar/:id', {
    schema: {
      description: 'Elimina permanentemente una ruta del sistema. Esta acción no puede deshacerse.',
      summary: 'Eliminar ruta permanentemente',
      tags: ['Rutas'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la ruta (MongoDB ObjectId)' }
        }
      }
    }
  }, permanentDeleteRoute);
}
