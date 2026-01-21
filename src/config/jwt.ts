import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from "fastify";
import { envs } from "./env.config.js";
import { Admin } from "../models/admin.js"; // ✅ Importar modelo Admin
import { User } from "../models/user.js";

export default fp(async (fastify, _opts) => {
  fastify.register(fastifyJwt, {
    secret: envs.JWT_SECRET
  });

  // ✅ Middleware específico para ADMINISTRADORES (tabla Admin)
  fastify.decorate('authenticateAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as { email: string; role: string };
    
      // ✅ Buscar en la tabla Admin (no en User)
      const admin = await Admin.findOne({ email: payload.email });

      if (!admin) {
        reply.code(403).send({ 
          error: "Forbidden", 
          message: "No tienes permisos de administrador" 
        });
        return;
      }

      // Agregar datos del admin al request
      (request as any).admin = admin;

    } catch (err) {
      reply.code(401).send({
        error: "Unauthorized",
        message: "Token inválido o expirado"
      });
    }
  });

  // Middleware genérico para usuarios
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

});

