import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes";
import { databaseRoutes } from "./database.routes";

export async function routes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes);
  await fastify.register(databaseRoutes);
}

