import { z } from 'zod';

export const busFareSchema = z.object({
  farePrice: z.number().positive({ message: "La tarifa debe ser un número positivo" }),
});

export const busFareJsonSchema = {
  type: 'object',
  required: ['farePrice'],
  properties: {
    farePrice: { 
      type: 'number',
      description: 'Precio único del pasaje en Bolívares (Bs)' 
    },
  },
};