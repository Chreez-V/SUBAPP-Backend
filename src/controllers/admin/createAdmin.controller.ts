import { FastifyRequest, FastifyReply } from 'fastify';
import { createAdmin, findAdminByEmail } from '../../models/admin.js';

export async function createAdminController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { fullName, email, password, phone } = request.body as {
        fullName: string;
        email: string;
        password: string;
        phone?: string;
    };

    // Validar datos requeridos
    if (!fullName || !email || !password) {
        return reply.status(400).send({
            success: false,
            error: 'Faltan datos requeridos: fullName, email y password son obligatorios',
        });
    }

    try {
        // Verificar que el email no exista
        const existingEmail = await findAdminByEmail(email);
        if (existingEmail) {
            return reply.status(409).send({
                success: false,
                error: 'El correo electrónico ya está registrado',
            });
        }

        // Crear administrador
        const admin = await createAdmin({
            fullName,
            email,
            password,
            phone,
        });

        return reply.status(201).send({
            success: true,
            message: 'Administrador creado exitosamente',
            data: admin,
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        return reply.status(500).send({
            success: false,
            error: 'Error al crear administrador',
        });
    }
}
