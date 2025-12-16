import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export function createJwtMiddleware(fastify: FastifyInstance) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization || '';
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.status(401).send({ error: 'Token inválido' });
    }

    const token = parts[1];
    try {
      const decoded = await fastify.jwt.verify(token);
      (request as any).user = decoded;
    } catch {
      return reply.status(401).send({ error: 'Token inválido' });
    }
  };
}


export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    },
    description: 'Esquema para la solicitud de inicio de sesión',
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' }
      }
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};
