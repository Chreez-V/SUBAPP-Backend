import { FastifyRequest, FastifyReply } from 'fastify';
import { Admin } from '../../models/admin.js';

interface DeleteAdminParams {
    id: string;
}

export async function deleteAdminController(
    request: FastifyRequest<{ Params: DeleteAdminParams }>,
    reply: FastifyReply
) {
    const { id } = request.params;

    try {
        // Verificar que el admin existe
        const existingAdmin = await Admin.findById(id);
        if (!existingAdmin) {
            return reply.status(404).send({
                success: false,
                error: 'Administrador no encontrado',
            });
        }

        // Eliminar admin
        await Admin.findByIdAndDelete(id);

        return reply.status(200).send({
            success: true,
            message: 'Administrador eliminado exitosamente',
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        return reply.status(500).send({
            success: false,
            error: 'Error al eliminar administrador',
        });
    }
}
