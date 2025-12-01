import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes";
import { databaseRoutes } from "./database.routes";
import { authRoutes } from "./auth"; 

export async function routes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes);
  await fastify.register(databaseRoutes);
  await fastify.register(authRoutes);

  await fastify.register(authRoutes, { 
    prefix: '/auth' 
  });
}