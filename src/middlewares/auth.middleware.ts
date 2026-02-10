import { createJwtMiddleware } from './authMiddleware.js'

export const authenticateToken = createJwtMiddleware

export { requireRole } from './requireRole.js'
export { requireAdmin } from './requireAdmin.js'
export { requireSupport, requireSupportOnly } from './supportAuth.js'