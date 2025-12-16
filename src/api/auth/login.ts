import { LoginController } from "@/controllers/auth/LoginController";
import { createJwtMiddleware, loginSchema } from "@/middlewares/authMiddleware";
import { FastifyInstance } from "fastify";

export async function LoginRoutes(fastify: FastifyInstance) {
    const authenticate = createJwtMiddleware(fastify)
  fastify.post('/login', { schema: loginSchema }, LoginController.login)
}
