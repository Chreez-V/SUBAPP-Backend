import { FastifyInstance } from "fastify";
import { getFareController, updateFareController } from "../controllers/busFare_controller.js";
import { busFareJsonSchema } from "../validators/busFare_validator.js";

export async function busFareRoutes(fastify: FastifyInstance) {
  fastify.get("/bus-fare", {
    schema: {
      tags: ["BusFare"],
      summary: "Obtener tarifa única en Bs"
    }
  }, getFareController);

  fastify.put("/bus-fare", {
    schema: {
      tags: ["BusFare"],
      summary: "Actualizar tarifa única en Bs",
      body: busFareJsonSchema
    }
  }, updateFareController);
}