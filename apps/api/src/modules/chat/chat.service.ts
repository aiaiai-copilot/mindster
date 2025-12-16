import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../shared/db'
import { conversations, messages, type Conversation, type Message } from '../../shared/db/schema'
import { providersService } from '../providers/providers.service'
import type { CreateConversationInput, SendMessageInput } from './chat.schemas'

export type ConversationWithMessages = Conversation & { messages: Message[] }

/**
 * Generate a title from the first user message
 */
function generateTitle(content: string): string {
  const maxLength = 50
  if (content.length <= maxLength) {
    return content
  }
  return content.substring(0, maxLength).trim() + '...'
}

export const chatService = {
  /**
   * List all conversations for a user
   */
  async listConversations(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Conversation[]> {
    return await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: [desc(conversations.updatedAt)],
      limit,
      offset,
    })
  },

  /**
   * Create a new conversation
   */
  async createConversation(
    userId: string,
    data: CreateConversationInput
  ): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({
        userId,
        providerId: data.providerId,
        model: data.model,
        title: data.title,
      })
      .returning()

    return conversation
  },

  /**
   * Get a conversation by ID with all messages
   */
  async getConversationById(userId: string, id: string): Promise<ConversationWithMessages | null> {
    const conversation = await db.query.conversations.findFirst({
      where: and(eq(conversations.id, id), eq(conversations.userId, userId)),
    })

    if (!conversation) {
      return null
    }

    const conversationMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: [desc(messages.createdAt)],
    })

    return {
      ...conversation,
      messages: conversationMessages,
    }
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning()

    return result.length > 0
  },

  /**
   * List messages for a conversation
   */
  async listMessages(
    userId: string,
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    // First verify the conversation belongs to the user
    const conversation = await db.query.conversations.findFirst({
      where: and(eq(conversations.id, conversationId), eq(conversations.userId, userId)),
    })

    if (!conversation) {
      return []
    }

    return await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: [desc(messages.createdAt)],
      limit,
      offset,
    })
  },

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    userId: string,
    conversationId: string,
    data: SendMessageInput
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    // Get conversation and verify ownership
    const conversation = await db.query.conversations.findFirst({
      where: and(eq(conversations.id, conversationId), eq(conversations.userId, userId)),
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Get provider with decrypted API key
    if (!conversation.providerId) {
      throw new Error('Conversation has no associated provider')
    }

    const provider = await providersService.getWithApiKey(userId, conversation.providerId)
    if (!provider) {
      throw new Error('Provider not found')
    }

    // Save user message
    const [userMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        role: 'user',
        content: data.content,
      })
      .returning()

    // Get conversation history
    const messageHistory = await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: [desc(messages.createdAt)],
    })

    // Build messages array for API (reverse to chronological order)
    const apiMessages = messageHistory
      .reverse()
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    // Call AI API
    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: conversation.model,
          messages: apiMessages,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `AI API error: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      const result = await response.json()
      const assistantContent = result.choices?.[0]?.message?.content

      if (!assistantContent) {
        throw new Error('No response from AI')
      }

      // Save assistant message
      const [assistantMessage] = await db
        .insert(messages)
        .values({
          conversationId,
          role: 'assistant',
          content: assistantContent,
        })
        .returning()

      // Auto-generate title from first user message if not set
      if (!conversation.title) {
        const title = generateTitle(data.content)
        await db
          .update(conversations)
          .set({ title, updatedAt: new Date() })
          .where(eq(conversations.id, conversationId))
      } else {
        // Update conversation timestamp
        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, conversationId))
      }

      return { userMessage, assistantMessage }
    } catch (error) {
      // If AI call fails, we still have the user message saved
      throw error
    }
  },
}
