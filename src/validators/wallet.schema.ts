import { z } from 'zod'

// Esquema para POST /api/billetera/recargar
export const recargarSchema = z.object({
  body: z.object({
    referenciaPago: z
      .string()
      .min(3, 'La referencia de pago es obligatoria y debe ser válida'), //Valida el formato de la referencia de pago, debe tener al menos 3 caracteres
    monto: z
      .number()
      .positive('El monto debe ser un número positivo mayor a 0'), //Valida que el monto no sea un numero negativo o cero
    banco: z.string().min(2, 'Debe especificar el banco de origen').optional(), //Banco es opcional pero si se proporciona debe tener al menos 2 caracteres
    fechaPago: z.coerce
      .date({ message: 'La fecha de pago debe ser una fecha válida' }) // Valida que la fecha de pago sea una fecha válida
      .optional(),
    comprobanteUrl: z.url('Debe ser una URL válida').optional(), // Validamos que sea una URL válida si se proporciona
  }),
})

// Esquema para POST /api/billetera/transferir
export const transferirSchema = z.object({
  body: z.object({
    destinatarioEmail: z.email(
      'Debe proporcionar un correo electrónico válido',
    ), //z.email() para validar formato de email
    monto: z
      .number()
      .positive('El monto a transferir debe ser un número positivo mayor a 0'), //Valida que el monto no sea un numero negativo o cero
  }),
})

// Exportamos los tipos inferidos para usarlos en los controladores y tener autocompletado
export type RecargarBody = z.infer<typeof recargarSchema>['body']
export type TransferirBody = z.infer<typeof transferirSchema>['body']
