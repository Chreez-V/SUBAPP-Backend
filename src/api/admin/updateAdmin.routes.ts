import { FastifyInstance } from 'fastify';
import { updateAdminController } from '../../controllers/admin/updateAdmin.controller.js';
import { updateAdminJsonSchema, adminResponseSchema } from '../../validators/admin.schema.js';
import isAuth from '../../middlewares/isAuth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';

export async function updateAdminRoute(fastify: FastifyInstance) {
    fastify.put('/actualizar/:id', {
        schema: {
            description: 'Actualiza los datos de un administrador existente por su ID. Solo se pueden modificar los campos enviados en el cuerpo de la petición.',
            summary: 'Actualizar administrador',
            tags: ['Admin'],
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
    }, updateAdminController);
}
