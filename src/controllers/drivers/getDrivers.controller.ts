import { FastifyRequest, FastifyReply } from 'fastify';
import { getDrivers } from '../../models/driver';

export async function getDriversController(request: FastifyRequest, reply: FastifyReply){
    try{
        const drivers = await getDrivers()

        if(drivers.length == 0){
            return reply.code(404).send({ message: 'No se encontraron conductores registrados'})
        }

        return reply.code(200).send(drivers)
    
    }catch(error){
        console.error('Error intentando obtener a los conductores: ', error)
        return reply.code(500).send({ message: 'Error al intentar obtener a los conductores' })
    }
}