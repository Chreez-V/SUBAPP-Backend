import { FastifyInstance } from 'fastify';
import { GetCurrentUserController } from '../../controllers/auth/GetCurrentUser_Controller.js';
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js';

export async function currentUserRoute(fastify: FastifyInstance) {
  const authenticate = createJwtMiddleware(fastify);

  fastify.get('/me', {
    preHandler: authenticate,
    schema: {
      tags: ['Auth'],
      description: 'Obtener información del usuario autenticado',
      summary: 'Get current authenticated user',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                fullName: { type: 'string' },
                role: { type: 'string', enum: ['passenger', 'driver', 'admin'] },
                credit: { type: 'number' },
                licenseNumber: { type: 'string' },
                phone: { type: 'string' },
                status: { type: 'string' },
                lastLogin: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, GetCurrentUserController.getCurrentUser);
}
