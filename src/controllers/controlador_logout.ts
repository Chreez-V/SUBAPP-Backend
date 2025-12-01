// src/controllers/AuthController.ts

import type { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Función que maneja el cierre de sesión del usuario.
 * Su objetivo principal es instruir al cliente para que elimine la cookie de sesión (JWT).
 */
export async function logoutController(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Usamos reply.clearCookie, dependemos de que `@fastify/cookie` esté registrado.
        reply.clearCookie('accessToken', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return reply.status(200).send({ message: 'Sesión cerrada exitosamente.' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        return reply.status(500).send({ message: 'Error interno del servidor.' });
    }
}