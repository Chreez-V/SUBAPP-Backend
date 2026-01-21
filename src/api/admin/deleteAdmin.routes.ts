import { FastifyInstance } from 'fastify';
import { deleteAdminController } from '../../controllers/admin/deleteAdmin.controller.js';
import isAuth from '../../middlewares/isAuth.js';
import requireAdmin from '../../middlewares/requireAdmin.js';

export async function deleteAdminRoute(fastify: FastifyInstance) {
    fastify.delete('/:id', {
        schema: {
            description: 'Eliminar permanentemente un administrador del sistema',
            tags: ['Admin'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID del administrador a eliminar',
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
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
        return deleteAdminController(request as any, reply);
    });
}
