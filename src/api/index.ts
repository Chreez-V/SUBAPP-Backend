import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";
import { databaseRoutes } from "./database.routes.js";
import logoutRoute from "./auth/logout.js";
import { LoginRoutes } from "./auth/login.js";
import { register } from "./auth/register.js";
import changePasswordRoutes from "./auth/change-password.js";
import { usersRoutes } from "./auth/delete.js";
import { passengersRoutes } from "./passengers.routes.js";
import { googleAuthRoutes } from "./auth/google-auth.js";
import { routesRoutes } from "../routes/routes.routes.js";
import { adminRoutes } from "./admin/index.js";

export async function routes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes);
  await fastify.register(databaseRoutes);

  // Auth module routes
  await fastify.register(LoginRoutes, { prefix: '/auth' });
  await fastify.register(logoutRoute, { prefix: '/auth' });
  await fastify.register(register, { prefix: '/auth' });
  await fastify.register(changePasswordRoutes, { prefix: '/auth' });
  await fastify.register(usersRoutes, { prefix: '/auth' });
  await fastify.register(googleAuthRoutes, { prefix: '/auth' });

  // Admin module routes
  await fastify.register(adminRoutes, { prefix: '/api/admin' });
  
  // Passengers routes
  await fastify.register(passengersRoutes, { prefix: '/api' });

  // Routes management
  await fastify.register(routesRoutes, { prefix: '/api' });
}