import Fastify from "fastify";
import mongoose from "mongoose";
import "dotenv/config";
import { envs } from "@/config/env.config";

const server = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    }
  }
});

// Conexión a MongoDB con Mongoose
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(envs.MONGODB_URL);

    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

server.get("/healthcheck", async function () {
  return { status: "OK" }
});

server.get("/test-db", async function (_, reply) {
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

export async function main(): Promise<void> {
  try {
    // Conectar a la base de datos primero
    await connectDB();
    
    await server.listen({ 
      port: envs.PORT || 3500,
      host: envs.HOST || "0.0.0.0"
    });
    
    console.log(`Server ready at http://localhost:${envs.PORT || 3500}`);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    
    console.error(errorMessage);
    process.exit(1);
  }
}

main();
