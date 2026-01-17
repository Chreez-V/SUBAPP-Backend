import { FastifyInstance } from 'fastify';
import { deleteUserController } from '../../controllers/auth/DeleteUser_controller.js';

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.delete('/users', {
    schema: {
      description: 'Eliminar usuario por correo electrónico',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, deleteUserController);
}
