import { FastifyInstance } from 'fastify';
import { getAdminController } from '../../controllers/admin/getAdmin.controller.js';
import { adminResponseSchema } from '../../validators/admin.schema.js';

export async function getAdminRoute(fastify: FastifyInstance) {
    fastify.get('/:id', {
        schema: {
            description: 'Obtener un administrador específico por ID',
            tags: ['Admin'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID del administrador (MongoDB ObjectId)',
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: adminResponseSchema,
                    },
                },
                404: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
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
    }, async (request, reply) => {
        return getAdminController(request as any, reply);
    });
}
