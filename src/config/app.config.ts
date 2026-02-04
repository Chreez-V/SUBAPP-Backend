import Fastify from "fastify";
import { envs } from "./env.config.js";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import { routes } from "../api/index.js";
import jwtPlugin from "./jwt.js";

export async function app() {
  const server = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      }
    },
  });

  // ✅ CORS Configuration
  await server.register(fastifyCors, {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://subapp-api.onrender.com',
      'https://suba-admin-panel.vercel.app',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const swaggerServerUrl = isProduction
    ? 'https://subapp-api.onrender.com/'
    : `http://localhost:${envs.PORT || 3500}`;

  await server.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'API',
        version: '1.0.0'
      },
      servers: [{
        url: swaggerServerUrl,
        description: isProduction ? 'production' : 'local'
      }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list' as const,
      deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true
  });
 
  await server.register(jwtPlugin); 
  await server.register(routes);

  return server;
}
