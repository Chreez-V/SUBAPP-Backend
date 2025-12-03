import { type FastifyRequest, type FastifyReply } from "fastify";
import {findUserByEmail, createUser} from '../models/user'
import jwt from 'jsonwebtoken'

interface RegisterBody {
  fullName: string
  email: string
  password: string
  role?: 'passenger' | 'driver' | 'admin'
  credit?: number
}

type RegisterRequest = FastifyRequest<{ Body: RegisterBody }>

const JWT_SECRET =  '2d3f6a9b4c0e81d7f5a4e0c8b3a1d9c7f2e1a0b3c5d7f9e8a7c6b4d2a0e9c8b1d7f5e3a2b4c6d8e0f1a3b5c7d9e2a0b4' 
//const JWT_SECRET = //process.env.JWT_SECRET || '2d3f6a9b4c0e81d7f5a4e0c8b3a1d9c7f2e1a0b3c5d7f9e8a7c6b4d2a0e9c8b1d7f5e3a2b4c6d8e0f1a3b5c7d9e2a0b4' 

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

        //Generar el Token (JWT)
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' } 
        )

        return reply.status(201).send({
            message: 'Registro exitoso.',
            token,
            user: newUser,
        })git 

    } catch (error) {
        console.error('Error durante el registro:', error)

        if (error instanceof Error && error.name === 'ValidationError') {
            return reply.status(400).send({ message: error.message })
        }
        
        return reply.status(500).send({ message: 'Error interno del servidor.' });
    }
}