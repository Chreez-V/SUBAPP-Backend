import { FastifyRequest, FastifyReply } from 'fastify';
import { getDriverById } from '../../models/driver.js';

interface GetDriverParams {
    id: string
}

export async function getDriverController(request: FastifyRequest<{ Params: GetDriverParams }>, reply: FastifyReply){
    try{
        const { id } = request.params
        const driver = await getDriverById(id)

        if(!driver){
            return reply.code(404).send({ message: 'Driver not found'})
        }

        return reply.code(200).send({ success: true, data: driver })

    }catch(error){
        console.error('Error fetching driver: ', error)
        return reply.code(500).send({ message: 'Error fetching driver' })
    }
}