import { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/verificar-estado", {
    schema: {
      description: "Verifica que la API esté en línea y respondiendo correctamente",
      tags: ["Healthcheck"],
      summary: "Verificar estado del servidor",
      response: {
        200: {
          description: "El servidor está funcionando correctamente",
          type: "object",
          properties: {
            status: { type: "string", example: "OK" }
          }
        }
      }
    }
  }, async function () {
    return { status: "OK" }
  });
}

