import { FastifyRequest, FastifyReply } from 'fastify';
import { Driver, getDriverById } from '../../models/driver';

interface DeleteDriverParams {
    id: string
}

export async function deleteDriverController(request: FastifyRequest<{ Params: DeleteDriverParams }>, reply: FastifyReply){
    try{
        const { id } = request.params
        const existingDriver = await getDriverById(id)

        if(!existingDriver){
            return reply.code(404).send({ message: 'Conductor no encontrado'})
        }

        await Driver.findByIdAndDelete(id)

        return reply.code(200).send({ message: 'Conductor eliminado exitosamente'})

    }catch(error){
        console.error('Error intentando eliminar al conductor: ', error)
        return reply.code(500).send({ message: 'Error al intentar eliminar al conductor' })
    }
}