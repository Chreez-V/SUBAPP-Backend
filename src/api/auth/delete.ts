import { FastifyInstance } from 'fastify';
import { deleteUserController } from '../../controllers/auth/DeleteUser_controller.js';

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.delete('/usuarios', {
    schema: {
      description: 'Elimina permanentemente un usuario del sistema buscado por su dirección de correo electrónico.',
      summary: 'Eliminar usuario por correo',
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
