import type { FastifyInstance } from 'fastify'
import fastifySensible from '@fastify/sensible'
import fastifyCors from '@fastify/cors'
import { env } from '../lib/env'

export async function registerPlugins(app: FastifyInstance) {
  // Sensible defaults (httpErrors, assert, etc.)
  await app.register(fastifySensible)

  // CORS configuration
  await app.register(fastifyCors, {
    origin: env.NODE_ENV === 'development' ? true : ['https://mindstr.ru'],
    credentials: true,
  })
}
