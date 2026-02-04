import { getPassengers } from "../../models/user.js";
import { FastifyReply, FastifyRequest } from "fastify";

interface GetPassengersQuery {
  email?: string;
  fullName?: string;
  creditMin?: string;
  creditMax?: string;
}

export class GetPassengersController {
  static async getPassengers(request: FastifyRequest<{ Querystring: GetPassengersQuery }>, reply: FastifyReply) {
    try {
      const { email, fullName, creditMin, creditMax } = request.query;

      const parsedCreditMin = creditMin ? parseFloat(creditMin) : undefined;
      const parsedCreditMax = creditMax ? parseFloat(creditMax) : undefined;

      if ((parsedCreditMin !== undefined && isNaN(parsedCreditMin)) ||
          (parsedCreditMax !== undefined && isNaN(parsedCreditMax))) {
        return reply.status(400).send({ error: 'Credit limits must be valid numbers' });
      }

      const filters = {
        email,
        fullName,
        creditMin: parsedCreditMin,
        creditMax: parsedCreditMax,
      };

      const passengers = await getPassengers(filters);

      return reply.send({ passengers });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}