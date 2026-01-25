import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware para verificar que el usuario autenticado tenga rol de administrador
 * Debe usarse después del middleware isAuth
 */
export default async function requireAdmin(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        // El middleware isAuth debe haber poblado request.user
        const user = (request as any).user;

        if (!user) {
            return reply.code(401).send({
                success: false,
                error: 'No autenticado. Token JWT requerido.',
            });
        }

        if (user.role !== 'admin') {
            return reply.code(403).send({
                success: false,
                error: 'Acceso denegado. Se requiere rol de administrador.',
            });
        }

        // Usuario es admin, continuar con el request
    } catch (err) {
        return reply.code(403).send({
            success: false,
            error: 'No autorizado',
        });
    }
}
