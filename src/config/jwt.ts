import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from "fastify";
import { envs } from "./env.config.js";

export default fp(async (fastify, _opts) => {
  fastify.register(fastifyJwt, {
    secret: envs.JWT_SECRET
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply:FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});

