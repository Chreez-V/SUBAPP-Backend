import { FastifyReply, FastifyRequest } from "fastify";
import { OAuth2Client } from 'google-auth-library';
import { findUserByEmail, createUser } from "../../models/user.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleAuthBody {
  idToken: string;
  role?: 'passenger' | 'driver';
}

interface GooglePayload {
  email?: string;
  name?: string;
  email_verified?: boolean;
  sub?: string; // Google user ID
}

export class GoogleAuthController {
  /**
   * Verify Google ID Token and authenticate/register user
   */
  static async googleAuth(
    request: FastifyRequest<{ Body: GoogleAuthBody }>, 
    reply: FastifyReply
  ) {
    try {
      const { idToken, role = 'passenger' } = request.body;
      const fastify = request.server;

      if (!idToken) {
        return reply.status(400).send({ 
          success: false,
          message: 'ID Token de Google es requerido' 
        });
      }

      // Verify the Google ID token
      let payload: GooglePayload;
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        payload = ticket.getPayload() as GooglePayload;
        
        if (!payload || !payload.email_verified) {
          return reply.status(401).send({ 
            success: false,
            message: 'Email no verificado por Google' 
          });
        }
      } catch (error) {
        console.error('Error verifying Google token:', error);
        return reply.status(401).send({ 
          success: false,
          message: 'Token de Google inválido' 
        });
      }

      const { email, name, sub } = payload;

      if (!email) {
        return reply.status(400).send({ 
          success: false,
          message: 'Email no proporcionado por Google' 
        });
      }

      // Check if user exists
      let user = await findUserByEmail(email);

      // If user doesn't exist, create new user
      if (!user) {
        user = await createUser({
          fullName: name || email.split('@')[0],
          email: email,
          password: `google_${sub}_${Date.now()}`, // Random secure password (user won't use it)
          role: role,
          credit: 0,
        });

        console.log(`New user created via Google OAuth: ${email}`);
      }

      // Generate JWT token for our system
      const token = fastify.jwt.sign({ 
        email: user.email,
        role: user.role,
        id: user._id 
      });

      return reply.status(200).send({
        success: true,
        message: 'Autenticación exitosa',
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          credit: user.credit
        }
      });

    } catch (error) {
      console.error('Error in Google authentication:', error);
      return reply.status(500).send({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }
}
