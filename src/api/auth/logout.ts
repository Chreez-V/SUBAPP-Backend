import { FastifyInstance } from 'fastify';
import { logoutController } from '../../controllers/auth/Logout_Controller.js'; 
import isAuth from '../../middlewares/isAuth.js';

export default async function logoutRoute(fastify: FastifyInstance) {
    fastify.post('/logout', {
        schema: {
          description: 'Cerrar sesión del usuario actual (invalida el token en el cliente)',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          headers: {
            type: 'object',
            properties: {
              authorization: {
                type: 'string',
                description: 'Token JWT en formato: Bearer <token>'
              }
            },
            required: ['authorization']
          },
          response: {
            200: {
              type: 'object',
              properties: {
                message: { type: 'string' }
              }
            },
            401: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        },
        preHandler: [isAuth]
    }, logoutController);
}