import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";
import { databaseRoutes } from "./database.routes.js";
import  logoutRoute from "./auth/logout.js";
import { LoginRoutes } from "./auth/login.js";
import { register } from "./auth/register.js";
import changePasswordRoutes from "./auth/change-password.js";
import { usersRoutes } from "./auth/delete.js";
import { googleAuthRoutes } from "./auth/google-auth.js";
import { routesRoutes } from "../routes/routes.routes.js";
import { Route } from "../models/route.js";

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
  
  await fastify.register(googleAuthRoutes, {
    prefix: '/auth'
  });

  // Routes management
  await fastify.register(routesRoutes, { 
    prefix: '/api' 
  });

  // 🔧 Temporary fix endpoint - remove after first use
  fastify.get('/api/fix-routes-index', async (request, reply) => {
    try {
      const collection = Route.collection;
      
      // Drop old index if exists
      try {
        await collection.dropIndex('nombre_1');
        console.log('✅ Old index "nombre_1" dropped');
      } catch (err) {
        console.log('⚠️ Index "nombre_1" does not exist');
      }
      
      // Delete documents with null name
      const result = await Route.deleteMany({ name: null });
      console.log(`🗑️ Deleted ${result.deletedCount} documents with null name`);
      
      // List current indexes
      const indexes = await collection.indexes();
      
      return reply.send({
        success: true,
        message: 'Database cleaned successfully',
        deletedDocuments: result.deletedCount,
        indexes: indexes
      });
    } catch (error: any) {
      console.error('Error fixing indexes:', error);
      return reply.status(500).send({
        success: false,
        error: error.message
      });
    }
  });
}