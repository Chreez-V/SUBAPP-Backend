import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes";
import { databaseRoutes } from "./database.routes";
import  logoutRoute from "./auth/logout";
import { LoginRoutes } from "./auth/login";
import { register } from "./auth/register";

export async function routes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes);
  await fastify.register(databaseRoutes);
  
  await fastify.register(LoginRoutes, { 
    prefix: '/auth' 
  });
  await fastify.register(logoutRoute, { 
    prefix: '/auth' 
  });
  await fastify.register(register, {
    prefix: '/auth'
  });

}