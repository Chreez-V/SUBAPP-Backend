import { FastifyInstance } from 'fastify';
import { GoogleAuthController } from '../../controllers/auth/GoogleAuthController.js';

export async function googleAuthRoutes(fastify: FastifyInstance) {
  fastify.post('/autenticar-google', {
    schema: {
      description: 'Autentica o registra un usuario usando un token de identidad de Google OAuth2. Si el usuario no existe, es creado automáticamente.',
      summary: 'Autenticación con Google',
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
