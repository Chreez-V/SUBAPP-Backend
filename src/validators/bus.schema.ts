import { z } from 'zod'

export const createBusSchema = z.object({
  placa: z.string().min(2, 'La placa es obligatoria').max(10),
  marca: z.string().min(2, 'La marca es obligatoria'),
  modelo: z.string().min(1, 'El modelo es obligatorio'),
  anio: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  capacidad: z.number().int().min(1, 'La capacidad debe ser al menos 1'),
  status: z.enum(['Activo', 'Inactivo', 'Mantenimiento']).optional(),
  assignedRouteId: z.string().optional(),
  assignedDriverId: z.string().optional(),
  color: z.string().optional(),
  numeroInterno: z.string().optional(),
})

export const updateBusSchema = z.object({
  placa: z.string().min(2).max(10).optional(),
  marca: z.string().min(2).optional(),
  modelo: z.string().min(1).optional(),
  anio: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  capacidad: z.number().int().min(1).optional(),
  status: z.enum(['Activo', 'Inactivo', 'Mantenimiento']).optional(),
  assignedRouteId: z.string().nullable().optional(),
  assignedDriverId: z.string().nullable().optional(),
  color: z.string().optional(),
  numeroInterno: z.string().optional(),
})

export type CreateBusBody = z.infer<typeof createBusSchema>
export type UpdateBusBody = z.infer<typeof updateBusSchema>
