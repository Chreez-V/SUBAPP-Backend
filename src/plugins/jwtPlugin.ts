import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super-secret'
  });

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Token inválido' });
    }
  });
});

