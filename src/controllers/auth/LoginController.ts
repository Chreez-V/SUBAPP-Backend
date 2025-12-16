import { findUserByEmail } from "@/models/user";
import { FastifyReply, FastifyRequest } from "fastify";

interface LoginBody {
  email: string;
  password: string;
}

export class LoginController {
    static async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {

    const { email, password } = request.body 
    const fastify = request.server;

    const user = await findUserByEmail(email);
    if (!user) {
        return reply.status(401).send({ error: 'Credenciales inválidas' });
    }   
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Credenciales inválidas' });
    }
    const jwt = fastify.jwt.sign({ email });

    return { token: jwt };
    }
}