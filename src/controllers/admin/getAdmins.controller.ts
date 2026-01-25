import { FastifyRequest, FastifyReply } from 'fastify';
import { getAdmins } from '../../models/admin.js';


export async function getAdminsController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const admins = await getAdmins();

        return reply.status(200).send({
            success: true,
            count: admins.length,
            data: admins,
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        return reply.status(500).send({
            success: false,
            error: 'Error al obtener administradores',
        });
    }
}
