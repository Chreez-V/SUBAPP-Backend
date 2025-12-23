import { LoginController } from "../../controllers/auth/LoginController.js";
import { createJwtMiddleware, loginSchema } from "../../middlewares/authMiddleware.js";
import { FastifyInstance } from "fastify";

export async function LoginRoutes(fastify: FastifyInstance) {
  const authenticate = createJwtMiddleware(fastify);
  fastify.post('/login', {
    schema: {
      ...loginSchema,
      tags: ['Auth'],
      description: 'Inicio de sesión de usuario',
    },
  }, LoginController.login);
}
