import { FastifyInstance } from 'fastify';
import { createAdminController } from '../../controllers/admin/createAdmin.controller.js';
import { createAdminJsonSchema, adminResponseSchema } from '../../validators/admin.schema.js';
import isAuth from '../../middlewares/isAuth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';

export async function createAdminRoute(fastify: FastifyInstance) {
    fastify.post('/crear', {
        schema: {
            description: 'Crea un nuevo usuario con rol de administrador en el sistema. Requiere autenticación con rol de administrador.',
            summary: 'Crear administrador',
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
        preHandler: [isAuth, requireAdmin], // ✅ Requiere autenticación y rol de admin
    }, createAdminController);
}
