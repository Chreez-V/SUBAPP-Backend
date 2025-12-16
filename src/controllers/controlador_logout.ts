import type { FastifyRequest, FastifyReply } from 'fastify';

export async function logoutController(request: FastifyRequest, reply: FastifyReply) {
    try {
        
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