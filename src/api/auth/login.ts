import { LoginController } from "../../controllers/auth/LoginController.js";
import { createJwtMiddleware, loginSchema } from "../../middlewares/authMiddleware.js";
import { FastifyInstance } from "fastify";

export async function LoginRoutes(fastify: FastifyInstance) {
  const authenticate = createJwtMiddleware(fastify);
  fastify.post('/login', {
    schema: {
      ...loginSchema,
      tags: ['Auth'],
      description: 'Autentica a un usuario con email y contraseña. Retorna un token JWT para usar en las demás peticiones protegidas.',
      summary: 'Iniciar sesión',
    },
  }, LoginController.login);
}
