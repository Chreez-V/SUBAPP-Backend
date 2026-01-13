import { FastifyInstance } from 'fastify';
import { GetPassengersController } from '../controllers/passengers/GetPassengersController.js';

export async function passengersRoutes(fastify: FastifyInstance) {
  fastify.get('/passengers', {
    schema: {
      description: 'Obtener lista de pasajeros con filtros opcionales',
      tags: ['Passengers'],
      querystring: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Filtrar por email (búsqueda parcial)' },
          fullName: { type: 'string', description: 'Filtrar por nombre completo (búsqueda parcial)' },
          creditMin: { type: 'string', description: 'Crédito mínimo' },
          creditMax: { type: 'string', description: 'Crédito máximo' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            passengers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  credit: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, GetPassengersController.getPassengers);
}