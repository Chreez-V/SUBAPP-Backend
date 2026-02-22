import { FastifyInstance } from 'fastify'
import { healthRoutes } from './health.routes.js'
import { databaseRoutes } from './database.routes.js'
import logoutRoute from './auth/logout.js'
import { LoginRoutes } from './auth/login.js'
import { register } from './auth/register.js'
import changePasswordRoutes from './auth/change-password.js'
import { usersRoutes } from './auth/delete.js'
import { driversRoutes } from './drivers/drivers.routes.js'
import { busFareRoutes } from './busfare/busFare.routes.js'
import tripRoutes from './trip.routes.js'
import { passengersRoutes } from './passengers.routes.js'
import { googleAuthRoutes } from './auth/google-auth.js'
import { routesRoutes } from '../routes/routes.routes.js'
import { stopsRoutes } from '../routes/stops.routes.js'
import { routeSetsRoutes } from '../routes/routeSets.routes.js'
import { reportsRoutes } from '../routes/reports.routes.js'
import { adminRoutes } from './admin/index.js'
import { currentUserRoute } from './auth/me.js'
import supportRoutes from './support/index.js'
import { profileRoutes } from './auth/profile.routes.js'
import { walletRoutes } from '../api/wallet/wallet.routes.js'

export async function routes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes)
  await fastify.register(databaseRoutes)

  // Auth module routes
  await fastify.register(LoginRoutes, { prefix: '/auth' })
  await fastify.register(logoutRoute, { prefix: '/auth' })
  await fastify.register(register, { prefix: '/auth' })
  await fastify.register(changePasswordRoutes, { prefix: '/auth' })
  await fastify.register(usersRoutes, { prefix: '/auth' })
  await fastify.register(googleAuthRoutes, { prefix: '/auth' })
  await fastify.register(currentUserRoute, { prefix: '/auth' })
  await fastify.register(profileRoutes, { prefix: '/auth' })

  // Admin module routes
  await fastify.register(adminRoutes, { prefix: '/api/admin' })

  // Passengers routes
  await fastify.register(passengersRoutes, { prefix: '/api' })

  // Routes management
  await fastify.register(routesRoutes, { prefix: '/api' })

  // Stops management
  await fastify.register(stopsRoutes, { prefix: '/api' })

  // Route Sets (conjuntos) management
  await fastify.register(routeSetsRoutes, { prefix: '/api' })

  // Reports management
  await fastify.register(reportsRoutes, { prefix: '/api' })

  // Pasaje routes
  await fastify.register(busFareRoutes, { prefix: '/api/pasajes' })

  // Conductores routes
  await fastify.register(driversRoutes, { prefix: '/api/conductores' })

  // Viajes routes
  await fastify.register(tripRoutes, { prefix: '/api/viajes' })

  // Support routes
  await fastify.register(supportRoutes, { prefix: '/api' })

  await fastify.register(walletRoutes, { prefix: '/wallet' })
}
