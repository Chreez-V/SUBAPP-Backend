import { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/healthcheck", {
    schema: {
      description: "Health check endpoint to verify API status",
      tags: ["Healthcheck"],
      summary: "Health check",
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" }
          }
        }
      }
    }
  }, async function () {
    return { status: "OK" }
  });
}

