import type { FastifyPluginAsync } from 'fastify'
import { providersService } from './providers.service'
import { CreateProviderSchema, UpdateProviderSchema } from './providers.schemas'

// Common provider response schema
const providerResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    baseUrl: { type: 'string' },
    isActive: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
}

export const providersRoutes: FastifyPluginAsync = async (fastify) => {
  // All routes require authentication
  fastify.addHook('preHandler', fastify.authenticate)

  // List all providers for current user
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: providerResponseSchema,
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const providers = await providersService.list(request.user.userId)
      return providers
    },
  })

  // Create a new provider
  fastify.post('/', {
    schema: {
      body: CreateProviderSchema,
      response: {
        201: providerResponseSchema,
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      try {
        const provider = await providersService.create(request.user.userId, request.body as any)
        return reply.status(201).send(provider)
      } catch (error) {
        fastify.log.error(error)
        return reply.internalServerError('Failed to create provider')
      }
    },
  })

  // Get a single provider
  fastify.get<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: providerResponseSchema,
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const provider = await providersService.getById(request.user.userId, request.params.id)

      if (!provider) {
        return reply.notFound('Provider not found')
      }

      return provider
    },
  })

  // Update a provider
  fastify.patch<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: UpdateProviderSchema,
      response: {
        200: providerResponseSchema,
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const provider = await providersService.update(
        request.user.userId,
        request.params.id,
        request.body as any
      )

      if (!provider) {
        return reply.notFound('Provider not found')
      }

      return provider
    },
  })

  // Delete a provider
  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        204: { type: 'null' },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const deleted = await providersService.delete(request.user.userId, request.params.id)

      if (!deleted) {
        return reply.notFound('Provider not found')
      }

      return reply.status(204).send()
    },
  })

  // Test connection to provider API
  fastify.post<{ Params: { id: string } }>('/:id/test', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            models: {
              type: 'array',
              items: { type: 'string' },
            },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const result = await providersService.testConnection(request.user.userId, request.params.id)

      return result
    },
  })
}
