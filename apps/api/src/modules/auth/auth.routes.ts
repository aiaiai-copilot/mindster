import type { FastifyPluginAsync } from 'fastify'
import { authService } from './auth.service'
import { RegisterSchema, LoginSchema } from './auth.schemas'

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register admin (only if no users exist)
  fastify.post('/register', {
    schema: {
      body: RegisterSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: ['string', 'null'] },
                isAdmin: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
            token: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await authService.register(request.body as any)
        return result
      } catch (error) {
        fastify.log.error(error)
        if (error instanceof Error) {
          return reply.badRequest(error.message)
        }
        throw error
      }
    },
  })

  // Login with email/password
  fastify.post('/login', {
    schema: {
      body: LoginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: ['string', 'null'] },
                isAdmin: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
            token: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await authService.login(request.body as any)
        return result
      } catch (error) {
        fastify.log.error(error)
        if (error instanceof Error) {
          return reply.unauthorized(error.message)
        }
        throw error
      }
    },
  })

  // Get current user (requires authentication)
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: ['string', 'null'] },
            isAdmin: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const user = await authService.getCurrentUser(request.user.userId)

      if (!user) {
        return reply.notFound('User not found')
      }

      return user
    },
  })

  // Logout (requires authentication)
  fastify.post('/logout', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      // JWT is stateless, so we just return success
      // Client should remove the token from storage
      return {
        message: 'Logged out successfully',
      }
    },
  })
}
