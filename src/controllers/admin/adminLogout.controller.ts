import { FastifyRequest, FastifyReply } from 'fastify';
import { Admin } from '../../models/admin.js';

export class AdminLogoutController {
    static async logout(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Verificar que el usuario esté autenticado
            const user = request.user as { email: string; role: string };

            // Opcional: Actualizar lastLogin o agregar log de logout
            await Admin.findOneAndUpdate(
                { email: user.email },
                { $set: { lastLogin: new Date() } }
            );

            return reply.status(200).send({
                success: true,
                message: 'Sesión cerrada exitosamente. El token ha sido invalidado en el cliente.',
            });
        } catch (error) {
            console.error('Error al cerrar sesión de admin:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor al cerrar sesión',
            });
        }
    }
}
