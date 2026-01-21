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
  fastify.get('/routes', {
    schema: {
      description: 'Get all routes (active and inactive)',
      tags: ['Routes'],
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
  fastify.get('/routes/active', {
    schema: {
      description: 'Get only active routes',
      tags: ['Routes'],
    }
  }, getActiveRoutes);

  // GET - Get route by ID
  fastify.get('/routes/:id', {
    schema: {
      description: 'Get a specific route by ID',
      tags: ['Routes'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, getRouteById);

  // POST - Create new route
  fastify.post('/routes', {
    schema: {
      description: 'Create a new route using OSRM',
      tags: ['Routes'],
      body: {
        type: 'object',
        required: ['name', 'startPoint', 'endPoint'],
        properties: {
          name: { type: 'string' },
          startPoint: {
            type: 'object',
            required: ['lat', 'lng'],
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' }
            }
          },
          endPoint: {
            type: 'object',
            required: ['lat', 'lng'],
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' }
            }
          },
          fare: { type: 'number' },
          schedules: { 
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }, createRoute);

  // PATCH - Update a route
  fastify.patch('/routes/:id', {
    schema: {
      description: 'Update route information',
      tags: ['Routes'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          fare: { type: 'number' },
          isActive: { type: 'boolean' },
          schedules: { 
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }, updateRoute);

  // DELETE - Deactivate route (soft delete)
  fastify.delete('/routes/:id', {
    schema: {
      description: 'Deactivate a route (soft delete)',
      tags: ['Routes'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, deleteRoute);

  // DELETE - Permanently delete
  fastify.delete('/routes/:id/permanent', {
    schema: {
      description: 'Permanently delete a route',
      tags: ['Routes'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, permanentDeleteRoute);
}
