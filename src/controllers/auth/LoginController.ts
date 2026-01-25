import { findUserByEmail, User } from "../../models/user.js";
import { Driver } from "../../models/driver.js";
import { FastifyReply, FastifyRequest } from "fastify";

interface LoginBody {
  email: string;
  password: string;
}

export class LoginController {
    static async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const started = Date.now();
    const { email, password } = request.body;
    const fastify = request.server;

    if (!email || !password) {
      return reply.status(401).send({ error: 'Credenciales incompletas' });
    }

    console.log(`[Auth] Incoming login: email=${email}`);

    // ✅ BÚSQUEDA PARALELA en User (passenger) y Driver
    const [userDoc, driverDoc] = await Promise.all([
      User.findOne({ email, role: 'passenger' }).select('+auth.password').lean(),
      Driver.findOne({ email }).select('+auth.password').lean(),
    ]);

    let authenticatedUser: any = null;
    let role: 'passenger' | 'driver' | null = null;

    // Determinar cuál modelo tiene el usuario
    if (userDoc) {
      authenticatedUser = userDoc;
      role = 'passenger';
    } else if (driverDoc) {
      authenticatedUser = driverDoc;
      role = 'driver';
    }

    if (!authenticatedUser || !role) {
      console.log(`[Auth] User not found (email=${email}) after ${Date.now() - started}ms`);
      return reply.status(401).send({ error: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const isPasswordValid = await (role === 'passenger' 
      ? User.schema.methods.comparePassword.call(authenticatedUser, password)
      : Driver.schema.methods.comparePassword.call(authenticatedUser, password)
    );

    if (!isPasswordValid) {
      console.log(`[Auth] Invalid password (email=${email}, role=${role}) total=${Date.now() - started}ms`);
      return reply.status(401).send({ error: 'Credenciales inválidas' });
    }

    console.log(`[Auth] Auth success (email=${email}, role=${role}) total=${Date.now() - started}ms`);

    // Generar JWT con role incluido
    const jwt = fastify.jwt.sign({ 
      email: authenticatedUser.email,
      role: role,
      id: authenticatedUser._id.toString(),
      fullName: authenticatedUser.fullName || authenticatedUser.name,
    });

    return { 
      token: jwt, 
      role: role,
      user: {
        id: authenticatedUser._id,
        email: authenticatedUser.email,
        fullName: authenticatedUser.fullName || authenticatedUser.name,
        role: role,
      }
    };
  }
}