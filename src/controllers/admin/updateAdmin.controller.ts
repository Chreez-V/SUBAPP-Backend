import { FastifyRequest, FastifyReply } from 'fastify';
import { getAdmins } from '../../models/admin.js';
import { Admin } from '../../models/admin.js';
import bcrypt from 'bcryptjs';

export async function updateAdminController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = request.params as { id: string };
    const updateData = request.body as {
        fullName?: string;
        email?: string;
        password?: string;
        phone?: string;
    };

    try {
        // Verificar que el admin existe
        const existingAdmin = await Admin.findById(id);
        if (!existingAdmin) {
            return reply.status(404).send({
                success: false,
                error: 'Administrador no encontrado',
            });
        }

        // Si se actualiza la contraseña, hashearla manualmente
        if (updateData.password) {
            const hashedPassword = await bcrypt.hash(updateData.password, 10);
            (updateData as any).auth = {
                password: hashedPassword,
            };
            delete updateData.password;
        }

        // Actualizar admin
        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true }).lean();

        return reply.status(200).send({
            success: true,
            message: 'Administrador actualizado exitosamente',
            data: updatedAdmin,
        });
    } catch (error) {
        console.error('Error updating admin:', error);
        return reply.status(500).send({
            success: false,
            error: 'Error al actualizar administrador',
        });
    }
}
