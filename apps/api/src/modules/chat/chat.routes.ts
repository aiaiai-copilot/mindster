import type { FastifyPluginAsync } from 'fastify'
import { chatService } from './chat.service'
import { CreateConversationSchema, SendMessageSchema } from './chat.schemas'

// Common response schemas
const conversationResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    providerId: { type: ['string', 'null'], format: 'uuid' },
    model: { type: 'string' },
    title: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
}

const messageResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    conversationId: { type: 'string', format: 'uuid' },
    role: { type: 'string', enum: ['user', 'assistant', 'system'] },
    content: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
}

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
  // All routes require authentication
  fastify.addHook('preHandler', fastify.authenticate)

  // List all conversations
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 },
        },
      },
      response: {
        200: {
          type: 'array',
          items: conversationResponseSchema,
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const query = request.query as { limit?: number; offset?: number }
      const conversations = await chatService.listConversations(
        request.user.userId,
        query.limit,
        query.offset
      )

      return conversations
    },
  })

  // Create a new conversation
  fastify.post('/', {
    schema: {
      body: CreateConversationSchema,
      response: {
        201: conversationResponseSchema,
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      try {
        const conversation = await chatService.createConversation(
          request.user.userId,
          request.body as any
        )
        return reply.status(201).send(conversation)
      } catch (error) {
        fastify.log.error(error)
        return reply.internalServerError('Failed to create conversation')
      }
    },
  })

  // Get a conversation with messages
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
        200: {
          type: 'object',
          properties: {
            ...conversationResponseSchema.properties,
            messages: {
              type: 'array',
              items: messageResponseSchema,
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const conversation = await chatService.getConversationById(
        request.user.userId,
        request.params.id
      )

      if (!conversation) {
        return reply.notFound('Conversation not found')
      }

      return conversation
    },
  })

  // Delete a conversation
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

      const deleted = await chatService.deleteConversation(request.user.userId, request.params.id)

      if (!deleted) {
        return reply.notFound('Conversation not found')
      }

      return reply.status(204).send()
    },
  })

  // List messages for a conversation
  fastify.get<{ Params: { id: string } }>('/:id/messages', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 },
        },
      },
      response: {
        200: {
          type: 'array',
          items: messageResponseSchema,
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      const query = request.query as { limit?: number; offset?: number }
      const messages = await chatService.listMessages(
        request.user.userId,
        request.params.id,
        query.limit,
        query.offset
      )

      return messages
    },
  })

  // Send a message
  fastify.post<{ Params: { id: string } }>('/:id/messages', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: SendMessageSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            userMessage: messageResponseSchema,
            assistantMessage: messageResponseSchema,
          },
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized('User not authenticated')
      }

      try {
        const result = await chatService.sendMessage(
          request.user.userId,
          request.params.id,
          request.body as any
        )
        return result
      } catch (error) {
        fastify.log.error(error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
        return reply.internalServerError(errorMessage)
      }
    },
  })
}
