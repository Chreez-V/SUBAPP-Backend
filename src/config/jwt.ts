import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from "fastify";
import { envs } from "./env.config.js";
import { User } from "../models/user.js";

export default fp(async (fastify, _opts) => {
  fastify.register(fastifyJwt, {
    secret: envs.JWT_SECRET
  });

 fastify.decorate('authenticateAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
       const payload = request.user as { email: string; role: string };
    
    const user = await User.findOne({ 
      email: payload.email, 
      role: "admin" 
    });

     if (!user) {
        reply.code(403).send({ 
          error: "Forbidden", 
          message: "No tienes permisos de administrador" 
        });
        return; // Importante: detener ejecución
      }

    } catch (err) {
      reply.send(err);
    }
  });
  fastify.decorate('authenticate', async (request: FastifyRequest, reply:FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

});

