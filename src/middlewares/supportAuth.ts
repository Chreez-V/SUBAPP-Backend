import { requireRole } from './requireRole.js'

export const requireSupport = requireRole(['support', 'admin'])

export const requireSupportOnly = requireRole(['support'])