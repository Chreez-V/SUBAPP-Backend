import { FastifyInstance } from 'fastify';
import { adminLoginRoute } from './adminLogin.routes.js';
import { adminLogoutRoute } from './adminLogout.routes.js';
import { getAdminsRoute } from './getAdmins.routes.js';
import { getAdminRoute } from './getAdmin.routes.js';
import { createAdminRoute } from './createAdmin.routes.js';
import { updateAdminRoute } from './updateAdmin.routes.js';
import { deleteAdminRoute } from './deleteAdmin.routes.js';


export async function adminRoutes(fastify: FastifyInstance) {
    // ✅ POST /api/admin/login - Login de administradores (público)
    await fastify.register(adminLoginRoute);

    // ✅ POST /api/admin/logout - Logout de administradores (requiere auth)
    await fastify.register(adminLogoutRoute);

    // ✅ Rutas CRUD de administradores (públicas para pruebas)
    // GET /api/admin - Listar todos los administradores
    await fastify.register(getAdminsRoute);

    // GET /api/admin/:id - Obtener admin por ID
    await fastify.register(getAdminRoute);

    // POST /api/admin - Crear nuevo administrador
    await fastify.register(createAdminRoute);

    // PUT /api/admin/:id - Actualizar administrador
    await fastify.register(updateAdminRoute);

    // DELETE /api/admin/:id - Eliminar administrador
    await fastify.register(deleteAdminRoute);
}
