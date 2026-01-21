import { FastifyInstance } from 'fastify';
import { createAdminController } from '../../controllers/admin/createAdmin.controller.js';
import { createAdminJsonSchema, adminResponseSchema } from '../../validators/admin.schema.js';

export async function createAdminRoute(fastify: FastifyInstance) {
    fastify.post('/', {
        schema: {
            description: 'Crear un nuevo administrador en el sistema',
            tags: ['Admin'],
            body: createAdminJsonSchema,
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: adminResponseSchema,
                    },
                },
                400: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
                    },
                },
                409: {
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
        return createAdminController(request as any, reply);
    });
}
