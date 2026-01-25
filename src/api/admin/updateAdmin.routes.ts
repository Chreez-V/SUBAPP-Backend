import { FastifyInstance } from 'fastify';
import { updateAdminController } from '../../controllers/admin/updateAdmin.controller.js';
import { updateAdminJsonSchema, adminResponseSchema } from '../../validators/admin.schema.js';
import isAuth from '../../middlewares/isAuth.js';
import requireAdmin from '../../middlewares/requireAdmin.js';


export async function updateAdminRoute(fastify: FastifyInstance) {
    fastify.put('/:id', {
        schema: {
            description: 'Actualizar los datos de un administrador existente',
            tags: ['Admin'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID del administrador a actualizar',
                    },
                },
            },
            body: updateAdminJsonSchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: adminResponseSchema,
                    },
                },
                401: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
                    },
                },
                403: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
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
        preHandler: [isAuth, requireAdmin],
    }, async (request, reply) => {
        return updateAdminController(request as any, reply);
    });
}
