"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const env_config_1 = require("@/config/env.config");
const app_config_1 = require("@/config/app.config");
// TODO: Move this to a database config file
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(env_config_1.envs.MONGODB_URL);
        console.log("✅ Connected to MongoDB Atlas");
    }
    catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
async function main() {
    try {
        await connectDB();
        const server = await (0, app_config_1.app)();
        await server.listen({
            port: env_config_1.envs.PORT || 3500,
            host: env_config_1.envs.HOST || "0.0.0.0"
        });
        console.log(`✅ Swagger docs available at http://localhost:${env_config_1.envs.PORT || 3500}/docs`);
        console.log(`Server ready at http://localhost:${env_config_1.envs.PORT || 3500}`);
    }
    catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
        console.error(errorMessage);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=app.js.map