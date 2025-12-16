import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { authService } from '../../modules/auth/auth.service'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string
      email: string
    }
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Decorate request with user property
  fastify.decorateRequest('user', undefined)

  // Authentication preHandler hook
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header',
        })
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix

      const payload = await authService.verifyToken(token)

      request.user = payload
    } catch (error) {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      })
    }
  })
}

export default fastifyPlugin(authPlugin)
