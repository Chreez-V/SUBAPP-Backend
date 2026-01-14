import { z } from 'zod';

export const createTripSchema = z.object({
  driverId: z.string().min(1, "El ID del conductor es requerido"),
  routeIdentifier: z.string().min(1, "La ruta es requerida"),
  vehiclePlate: z.string().optional(), 
});