import { FastifyInstance } from 'fastify';
import { getAdminsController } from '../../controllers/admin/getAdmins.controller.js';
import { adminResponseSchema } from '../../validators/admin.schema.js';

export async function getAdminsRoute(fastify: FastifyInstance) {
    fastify.get('/', {
        schema: {
            description: 'Listar todos los administradores del sistema',
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
        // ✅ Sin preHandler - No requiere autenticación
    }, getAdminsController);
}
