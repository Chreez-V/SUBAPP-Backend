import { FastifyRequest, FastifyReply } from 'fastify';
import { createDriver, getDriverByLicencia } from '../../models/driver';

interface CreateDriverBody {
    nombre: string
    email: string
    password: string
    numeroLicencia: string
    telefono: string
}

export async function createDriverController(request: FastifyRequest<{ Body: CreateDriverBody }>, reply: FastifyReply){
    try{
        const {nombre, email, password, numeroLicencia, telefono} = request.body
        
        if(!nombre || !email || !password || !numeroLicencia || !telefono){
            return reply.code(400).send({ message: 'Es obligatorio que todos los datos sean llenados' })
        }

        const existingLicenseNumber = await getDriverByLicencia(numeroLicencia)

        if(existingLicenseNumber){
            return reply.code(409).send({ message: 'El número de licencia ingresado ya está registrado'})
        }

        const driver = await createDriver({
            nombre,
            email,
            password,
            numeroLicencia,
            telefono,
        })

        return reply.code(201).send(driver)

    }catch(error){
        console.error('Error intentando crear al conductor: ', error)
        return reply.code(500).send({ message: 'Error al intentar crear al conductor' })
    }
}