import { FastifyInstance } from 'fastify';
import { GoogleAuthController } from '../../controllers/auth/GoogleAuthController.js';

export async function googleAuthRoutes(fastify: FastifyInstance) {
  fastify.post('/google-auth', {
    schema: {
      description: 'Autenticación con Google OAuth',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['idToken'],
        properties: {
          idToken: { 
            type: 'string', 
            description: 'Google ID Token obtenido del cliente' 
          },
          role: { 
            type: 'string', 
            enum: ['passenger', 'driver'], 
            description: 'Rol del usuario (por defecto: passenger)',
            default: 'passenger'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                fullName: { type: 'string' },
                role: { type: 'string' },
                credit: { type: 'number' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, GoogleAuthController.googleAuth);
}
