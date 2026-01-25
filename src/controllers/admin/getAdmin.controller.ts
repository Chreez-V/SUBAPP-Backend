import { FastifyRequest, FastifyReply } from 'fastify';
import { Admin } from '../../models/admin.js';

interface GetAdminParams {
    id: string;
}

export async function getAdminController(
    request: FastifyRequest<{ Params: GetAdminParams }>,
    reply: FastifyReply
) {
    const { id } = request.params;

    try {
        const admin = await Admin.findById(id).lean();

        if (!admin) {
            return reply.status(404).send({
                success: false,
                error: 'Administrador no encontrado',
            });
        }

        return reply.status(200).send({
            success: true,
            data: admin,
        });
    } catch (error) {
        console.error('Error fetching admin:', error);
        return reply.status(500).send({
            success: false,
            error: 'Error al obtener administrador',
        });
    }
}
