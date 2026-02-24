import { FastifyRequest, FastifyReply } from 'fastify';
import { getPaymentValidationById } from '../../models/paymentValidation';

interface PaymentParams {
    id: string
}

export async function getPaymentValidationController(request: FastifyRequest<{ Params: PaymentParams }>, reply: FastifyReply){
    try{
        const { id } = request.params
        const paymentValidation = await getPaymentValidationById(id)

        if(!paymentValidation){
            return reply.code(404).send({ message: 'Payment not found'})
        }

        return reply.code(200).send({ success: true, data: paymentValidation })

    }catch(error){
        console.error('Error fetching payment: ', error)
        return reply.code(500).send({ message: 'Error fetching payment' })
    }
}