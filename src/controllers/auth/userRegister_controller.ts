import { type FastifyRequest, type FastifyReply } from "fastify";
import { findUserByEmail, createUser } from '@/models/user'
import jwt from 'jsonwebtoken'

interface RegisterBody {
  fullName: string
  email: string
  password: string
  role?: 'passenger' | 'driver' | 'admin'
  credit?: number
}

// Small helper to ensure JWT secret is provided via environment
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  return secret
}

type RegisterRequest = FastifyRequest<{ Body: RegisterBody }>

export async function registerController(request: RegisterRequest, reply: FastifyReply) {
  const { fullName, email, password } = request.body

  if (!fullName || !email || !password) {
    return reply.status(400).send({
      message: 'Faltan datos requeridos.'
    })
  }

  try {
    if (await findUserByEmail(email)) {
      return reply.status(409).send({
        message: 'El correo electrónico ya está registrado.'
      })
    }

    const newUser = await createUser(request.body)

    const jwtSecret = getJwtSecret()

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      jwtSecret,
      { expiresIn: '7d' }
    )

    return reply.status(201).send({
      message: 'Registro exitoso.',
      token,
      user: newUser,
    })

  } catch (error) {
    console.error('Error durante el registro:', error)

    if (error instanceof Error && error.message.includes('JWT_SECRET is not defined')) {
      return reply.status(500).send({ message: 'Configuración del servidor incompleta: falta JWT_SECRET.' })
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return reply.status(400).send({ message: error.message })
    }

    return reply.status(500).send({ message: 'Error interno del servidor.' })
  }
}
