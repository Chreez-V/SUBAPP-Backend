import { FastifyInstance } from 'fastify';
import { getAdminsController } from '../../controllers/admin/getAdmins.controller.js';
import { adminResponseSchema } from '../../validators/admin.schema.js';
import isAuth from '../../middlewares/isAuth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';

export async function getAdminsRoute(fastify: FastifyInstance) {
    fastify.get('/listar', {
        schema: {
            description: 'Retorna la lista completa de todos los administradores registrados en el sistema. Requiere autenticación con rol de administrador.',
            summary: 'Listar todos los administradores',
            tags: ['Admin'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        count: { type: 'number' },
                        data: {
                            type: 'array',
                            items: adminResponseSchema,
                        },
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
                    },
                },
            },
        },
        preHandler: [isAuth, requireAdmin], // ✅ Requiere autenticación y rol de admin
    }, getAdminsController);
}
