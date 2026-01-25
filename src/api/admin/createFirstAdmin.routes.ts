import { FastifyInstance } from 'fastify';
import { createAdminController } from '../../controllers/admin/createAdmin.controller.js';

const createFirstAdminSchema = {
    body: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
            fullName: { 
                type: 'string',
                description: 'Nombre completo del administrador'
            },
            email: { 
                type: 'string', 
                format: 'email',
                description: 'Email del administrador'
            },
            password: { 
                type: 'string', 
                minLength: 6,
                description: 'Contraseña (mínimo 6 caracteres)'
            },
            phone: { 
                type: 'string',
                description: 'Teléfono del administrador (opcional)'
            }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        fullName: { type: 'string' },
                        role: { type: 'string' },
                        phone: { type: 'string' }
                    }
                }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
            }
        },
        403: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
            }
        },
        409: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
            }
        }
    }
};

export async function createFirstAdminRoute(fastify: FastifyInstance) {
    // ✅ SIN PROTECCIÓN - Solo funciona si no hay admins en la BD
    fastify.post('/setup', {
        schema: {
            ...createFirstAdminSchema,
            tags: ['Admin Setup'],
            description: '🔓 Crear el PRIMER administrador (solo funciona si no hay admins)',
            summary: 'Setup inicial - Crear primer admin'
        }
    }, createAdminController);
}
