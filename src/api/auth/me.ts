import { FastifyInstance } from 'fastify';
import { GetCurrentUserController } from '../../controllers/auth/GetCurrentUser_Controller.js';
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js';

export async function currentUserRoute(fastify: FastifyInstance) {
  const authenticate = createJwtMiddleware(fastify);

  fastify.get('/usuario-actual', {
    preHandler: authenticate,
    schema: {
      tags: ['Auth'],
      description: 'Retorna la información completa del usuario autenticado a partir de su token JWT. Requiere el header Authorization: Bearer <token>.',
      summary: 'Obtener usuario autenticado',
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
                role: { type: 'string', enum: ['passenger', 'driver', 'admin', 'support'] },
                profilePictureUrl: { type: 'string', nullable: true },
                credit: { type: 'number' },
                licenseNumber: { type: 'string' },
                phone: { type: 'string' },
                status: { type: 'string' },
lastLogin: { type: 'string' },
                department: { type: 'string' },
                level: { type: 'string' },
                supportStatus: { type: 'string' },
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
