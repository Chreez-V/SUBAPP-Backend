// JWT verification function
import { FastifyRequest, FastifyReply } from 'fastify'; 

export default async function isAuth(request: FastifyRequest , reply: FastifyReply){
    try {
      // This will verify the JWT and populate request.user
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({
        error: 'Authentication required',
        message: 'Please provide a valid token'
      });
    }
  };
