import { FastifyRequest, FastifyReply } from 'fastify';
import { getPaymentValidations } from '../../models/paymentValidation';

export async function getPaymentValidationsController(request: FastifyRequest, reply: FastifyReply){
    try{
        const paymentValidations = await getPaymentValidations()

        return reply.code(200).send({ success: true, data: paymentValidations })

    }catch(error){
        console.error('Error fetching payment validations: ', error)
        return reply.code(500).send({ message: 'Error fetching payment validations' })
    }
}