import Fastify, { type FastifyInstance } from 'fastify'
import { registerPlugins } from './shared/plugins'
import { env } from './shared/lib/env'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'info',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  })

  // Register plugins
  await registerPlugins(app)

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // API version prefix
  app.register(
    async (api) => {
      // Auth module
      const { authRoutes } = await import('./modules/auth')
      await api.register(authRoutes, { prefix: '/auth' })

      // Root endpoint
      api.get('/', async () => {
        return { message: 'Mindster API v1' }
      })
    },
    { prefix: '/api/v1' }
  )

  return app
}
