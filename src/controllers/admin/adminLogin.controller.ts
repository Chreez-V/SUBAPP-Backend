import { findAdminByEmail } from "../../models/admin.js";
import { FastifyReply, FastifyRequest } from "fastify";

interface AdminLoginBody {
  email: string;
  password: string;
}

export class AdminLoginController {
    static async login(request: FastifyRequest<{ Body: AdminLoginBody }>, reply: FastifyReply) {
        const { email, password } = request.body;
        const fastify = request.server;

        try {
            // ✅ Buscar SOLO en la tabla Admin
            const admin = await findAdminByEmail(email);
            
            if (!admin) {
                return reply.status(401).send({ 
                    error: 'Credenciales inválidas' 
                });
            }

            // Verificar contraseña
            const isPasswordValid = await admin.comparePassword(password);
            if (!isPasswordValid) {
                return reply.status(401).send({ 
                    error: 'Credenciales inválidas' 
                });
            }

            // Actualizar último login
            admin.lastLogin = new Date();
            await admin.save();

            // ✅ Generar JWT con email y role='admin'
            const token = fastify.jwt.sign({ 
                email: admin.email,
                role: admin.role  // Siempre será 'admin'
            });

            // ✅ Retornar token y datos del administrador
            return reply.send({
                token,
                user: {
                    id: admin._id,
                    email: admin.email,
                    fullName: admin.fullName,
                    role: admin.role,  // 'admin'
                    phone: admin.phone,
                    lastLogin: admin.lastLogin
                }
            });
        } catch (error) {
            console.error('Admin login error:', error);
            return reply.status(500).send({ 
                error: 'Error en el servidor' 
            });
        }
    }
}
