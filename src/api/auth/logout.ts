import { FastifyInstance } from 'fastify';
import { logoutController } from '../../controllers/auth/Logout_Controller.js'; 
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js';

export default async function logoutRoute(fastify: FastifyInstance) {
    const authenticate = createJwtMiddleware(fastify);
    
    fastify.post('/cerrar-sesion', {
        schema: {
          description: 'Cierra la sesión del usuario autenticado. El cliente debe eliminar el token JWT almacenado localmente.',
          summary: 'Cerrar sesión',
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
        preHandler: authenticate
    }, logoutController);
}