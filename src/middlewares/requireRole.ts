import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware genérico para verificar roles permitidos
 * Aplica el patrón del intern-system: un middleware reutilizable para cualquier combinación de roles
 * 
 * @param allowedRoles - Array de roles permitidos ('passenger', 'driver', 'admin')
 * @returns Middleware de Fastify
 * 
 * @example
 * // Solo supervisores pueden acceder
 * fastify.get('/api/driver-tasks', { preHandler: requireRole(['driver']) }, handler);
 * 
 * // Passenger y Driver pueden acceder
 * fastify.get('/api/profile', { preHandler: requireRole(['passenger', 'driver']) }, handler);
 */
export function requireRole(allowedRoles: Array<'passenger' | 'driver' | 'admin' | 'support'>) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;

      if (!user) {
        return reply.code(401).send({
          success: false,
          error: 'No autenticado. Token JWT requerido.',
        });
      }

      const { role } = user;

      if (!allowedRoles.includes(role)) {
        return reply.code(403).send({
          success: false,
          error: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
        });
      }

      // Usuario tiene un rol permitido, continuar
    } catch (err) {
      return reply.code(403).send({
        success: false,
        error: 'No autorizado',
      });
    }
  };
}
