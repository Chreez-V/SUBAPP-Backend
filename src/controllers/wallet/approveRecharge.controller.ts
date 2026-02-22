import { FastifyRequest, FastifyReply } from 'fastify'
import { PaymentValidation } from '../../models/paymentValidation'
import { User } from '../../models/user'
import { Transaction } from '../../models/transaction'

interface PaymentParams {
  id: string;
}

export async function approveRechargeController(request: FastifyRequest<{ Params: PaymentParams }>, reply: FastifyReply){
    
    try{
        const { id } = request.params
        const { id: adminId, role} = (request as any).user
    
        if(role !== 'admin'){
            return reply.status(401).send({ success: false, error: 'Acceso no autorizado' })
        }

        const paymentValidation = await PaymentValidation.findById(id)
        
        if(!paymentValidation){
            return reply.code(404).send({ message: 'Payment not found' })
        }
        
        if (paymentValidation.status !== 'pendiente') {
            return reply.code(400).send({ message: `The payment is not awaiting approval.` })
        }

        const user = await User.findById(paymentValidation.userId)

        if(!user){
            return reply.code(404).send({ message: 'User not found' })
        }
        
        const previousBalance = user.credit || 0
        const newBalance = previousBalance + paymentValidation.monto

        paymentValidation.status = 'aprobado'
        paymentValidation.reviewedBy = adminId
        paymentValidation.reviewedAt = new Date()
        user.credit = newBalance
        await paymentValidation.save()
        await user.save()

        const transaction = new Transaction({
                userId: paymentValidation.userId,
                type: 'recarga',
                amount: paymentValidation.monto,
                previousBalance: previousBalance,
                newBalance: newBalance,
                paymentValidationId: id,
        })
        await transaction.save()

        return reply.code(200).send({ success: true, message: 'Payment approved.', data: { newBalance: user.credit } })

    } catch (error) {
        console.error('Error approving payment:', error);
        return reply.code(500).send({ message: 'Error approving payment' })
    }
}