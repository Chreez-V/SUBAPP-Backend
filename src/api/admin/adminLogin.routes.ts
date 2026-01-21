import { FastifyInstance } from 'fastify';
import { AdminLoginController } from '../../controllers/admin/adminLogin.controller.js';

// Schema de validación para el login
const adminLoginSchema = {
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { 
                type: 'string', 
                format: 'email',
                description: 'Email del administrador'
            },
            password: { 
                type: 'string', 
                minLength: 6,
                description: 'Contraseña del administrador'
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        fullName: { type: 'string' },
                        role: { type: 'string' },
                        phone: { type: 'string' },
                        lastLogin: { type: 'string' }
                    }
                }
            }
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string' }
            }
        }
    }
};

export async function adminLoginRoute(fastify: FastifyInstance) {
    fastify.post('/login', {
        schema: {
            ...adminLoginSchema,
            tags: ['Admin Auth'],
            description: 'Login exclusivo para administradores',
            summary: 'Autenticación de administradores'
        }
    }, AdminLoginController.login);
}
