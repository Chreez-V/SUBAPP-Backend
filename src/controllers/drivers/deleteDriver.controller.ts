import { FastifyRequest, FastifyReply } from 'fastify';
import { Driver, getDriverById } from '../../models/driver.js';

interface DeleteDriverParams {
    id: string
}

export async function deleteDriverController(request: FastifyRequest<{ Params: DeleteDriverParams }>, reply: FastifyReply){
    try{
        const { id } = request.params
        const existingDriver = await getDriverById(id)

        if(!existingDriver){
            return reply.code(404).send({ message: 'Driver not found'})
        }

        await Driver.findByIdAndDelete(id)

        return reply.code(200).send({ success: true, message: 'Driver deleted successfully'})

    }catch(error){
        console.error('Error deleting driver: ', error)
        return reply.code(500).send({ message: 'Error deleting driver' })
    }
}