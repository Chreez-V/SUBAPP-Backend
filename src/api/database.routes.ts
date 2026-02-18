import { FastifyInstance } from "fastify";
import mongoose from "mongoose";

export async function databaseRoutes(fastify: FastifyInstance) {
  fastify.get("/probar-base-de-datos", {
    schema: {
      description: "Prueba la conexión con la base de datos MongoDB y retorna el estado de la conexión",
      tags: ["Database"],
      summary: "Probar conexión a la base de datos",
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            connection: { type: "string" },
            ping: { type: "object" },
            readyState: { type: "number" }
          }
        },
        500: {
          type: "object",
          properties: {
            error: { type: "string" },
            details: { type: "string" }
          }
        }
      }
    }
  }, async function (_, reply) {
    try {
      const connectionState = mongoose.connection.readyState;

      if (connectionState !== 1) {
        throw new Error(`Database not connected. State: ${connectionState}`);
      }

      if (!mongoose.connection.db) {
        throw new Error('Database instance not available');
      }

      const adminDb = mongoose.connection.db.admin();
      const serverInfo = await adminDb.command({ ping: 1 });

      return {
        status: "Database connected",
        connection: "MongoDB Atlas with Mongoose",
        ping: serverInfo,
        readyState: connectionState
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      this.log.error(`Database test failed: ${errorMessage}`);
      return reply.status(500).send({
        error: 'Database connection failed',
        details: errorMessage
      });
    }
  });
}

