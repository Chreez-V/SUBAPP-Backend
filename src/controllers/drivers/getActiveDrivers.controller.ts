import { FastifyRequest, FastifyReply } from 'fastify';
import { getDrivers } from '../../models/driver';

export async function getActiveDrivers(request: FastifyRequest, reply: FastifyReply){
    try{
        const activeDrivers = await getDrivers({ estado: 'Activo' })

        if(activeDrivers.length == 0){
            return reply.code(404).send({ message: 'No se encontraron conductores activos'})
        }

        return reply.code(200).send(activeDrivers);

    }catch(error){
        console.error('Error intentando obtener los conductores activos: ', error)
        return reply.code(500).send({ message: 'Error al intentar obtener los conductores activos' })
    }
}