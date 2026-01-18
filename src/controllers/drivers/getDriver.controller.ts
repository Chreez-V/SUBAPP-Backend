import { FastifyRequest, FastifyReply } from 'fastify';
import { getDriverById } from '../../models/driver';

interface GetDriverParams {
    id: string
}

export async function getDriverController(request: FastifyRequest<{ Params: GetDriverParams }>, reply: FastifyReply){
    try{
        const { id } = request.params
        const driver = await getDriverById(id)

        if(!driver){
            return reply.code(404).send({ message: 'Conductor no encontrado'})
        }

        return reply.code(200).send(driver)

    }catch(error){
        console.error('Error intentando obtener al conductor: ', error)
        return reply.code(500).send({ message: 'Error al intentar obtener al conductor' })
    }
}