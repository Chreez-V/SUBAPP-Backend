import { FastifyInstance } from 'fastify';
import { logoutController } from '@/controllers/controlador_logout';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/logout', {}, logoutController);
}
