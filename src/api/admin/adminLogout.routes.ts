import { FastifyInstance } from 'fastify';
import { AdminLogoutController } from '../../controllers/admin/adminLogout.controller.js';
import isAuth from '../../middlewares/isAuth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';

export async function adminLogoutRoute(fastify: FastifyInstance) {
    fastify.post('/logout', {
        schema: {
            description: 'Cerrar sesión de administrador',
            tags: ['Admin Auth'],
            summary: 'Logout de administrador',
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
