import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";
import { databaseRoutes } from "./database.routes.js";
import  logoutRoute from "./auth/logout.js";
import { LoginRoutes } from "./auth/login.js";
import { register } from "./auth/register.js";
import changePasswordRoutes from "./auth/change-password.js";
import { usersRoutes } from "./auth/delete.js";

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
  await fastify.register(changePasswordRoutes, {
    prefix: '/auth'
  });

  await fastify.register(usersRoutes,{prefix:'/auth'});

}