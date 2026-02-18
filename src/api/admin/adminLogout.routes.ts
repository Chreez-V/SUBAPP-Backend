import { FastifyInstance } from 'fastify';
import { AdminLogoutController } from '../../controllers/admin/adminLogout.controller.js';
import isAuth from '../../middlewares/isAuth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';

export async function adminLogoutRoute(fastify: FastifyInstance) {
    fastify.post('/cerrar-sesion', {
        schema: {
            description: 'Cierra la sesión del administrador autenticado. Requiere token JWT válido con rol de administrador.',
            tags: ['Admin Auth'],
            summary: 'Cerrar sesión de administrador',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
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
                        error: { type: 'string' }
                    }
                },
                500: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' }
                    }
                }
            }
        },
        preHandler: [isAuth, requireAdmin]
    }, AdminLogoutController.logout);
}
