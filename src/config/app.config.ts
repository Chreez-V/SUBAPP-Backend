import Fastify from "fastify";
import { envs } from "./env.config";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { routes } from "@/api";

export async function app() {
  const server = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      }
    },
  });

  await server.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'API',
        version: '1.0.0'
      },
      servers: [{
        url: `http://localhost:${envs.PORT || 3500}`,
        description: 'local'
      }],
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
 

  await server.register(routes);

  return server;
}
