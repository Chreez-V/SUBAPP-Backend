import Fastify from "fastify";
import { envs } from "./env.config.js";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
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
