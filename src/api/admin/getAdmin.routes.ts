import { FastifyInstance } from 'fastify';
import { getAdminController } from '../../controllers/admin/getAdmin.controller.js';
import { adminResponseSchema } from '../../validators/admin.schema.js';
import isAuth from '../../middlewares/isAuth.js';
import requireAdmin from '../../middlewares/requireAdmin.js';

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
        preHandler: [isAuth, requireAdmin], // ✅ Requiere autenticación y rol de admin
    }, async (request, reply) => {
        return getAdminController(request as any, reply);
    });
}
