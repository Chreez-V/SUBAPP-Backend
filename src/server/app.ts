import mongoose from "mongoose";
import "dotenv/config";
import { envs } from "../config/env.config";
import { app } from "../config/app.config";
import { startMqtt } from "../mqtt/plugins/mqttplugin";

// TODO: Move this to a database config file
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(envs.MONGODB_URL);

    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export async function main(): Promise<void> {
  try {
    await connectDB();

    const server = await app();

    await server.listen({
      port: envs.PORT || 3500,
      host: envs.HOST || "0.0.0.0"
    });

    console.log(`✅ Swagger docs available at http://localhost:${envs.PORT || 3500}/docs`);

    console.log(`Server ready at http://localhost:${envs.PORT || 3500}`);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    console.error(errorMessage);
    process.exit(1);
  }
}

//start MQTT example plugin (connects, subscribes, publishes)
//startMqtt();

main();
