import { FastifyInstance } from 'fastify';
import { forgotPassword, resetPassword } from '../controllers/auth.controller';
import { forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.schema';

async function authRoutes(fastify: FastifyInstance) {
  
  // Ruta: POST /api/auth/forgot-password
  fastify.post('/forgot-password', {
    schema: {
      body: forgotPasswordSchema // Documentación y validación automática si usas fastify-zod
    }
  }, forgotPassword);

  // Ruta: POST /api/auth/reset-password
  fastify.post('/reset-password', {
    schema: {
      body: resetPasswordSchema
    }
  }, resetPassword);

}

export default authRoutes;