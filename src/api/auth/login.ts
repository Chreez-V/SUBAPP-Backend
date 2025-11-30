import { AuthController } from "@/controllers/authController";
import { createJwtMiddleware, loginSchema } from "@/middlewares/authMiddleware";
import { FastifyInstance } from "fastify";

export async function authRoutes(fastify: FastifyInstance) {
    const authenticate = createJwtMiddleware(fastify)
  fastify.post('/login', { schema: loginSchema }, AuthController.login)
}
