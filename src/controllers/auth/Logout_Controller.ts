import type { FastifyRequest, FastifyReply } from 'fastify';

export async function logoutController(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Stateless JWT approach: no server-side session or cookies to clear.
        // Ensure the request is authenticated (via fastify.authenticate hook)
        // and simply indicate the client should delete its stored token.

        // If you are not using a global authenticate hook, you can explicitly verify:
        // await request.jwtVerify();

        return reply.status(200).send({
            message: 'Sesión cerrada exitosamente. El cliente debe eliminar el token JWT almacenado.',
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        return reply.status(500).send({ message: 'Error interno del servidor.' });
    }
}