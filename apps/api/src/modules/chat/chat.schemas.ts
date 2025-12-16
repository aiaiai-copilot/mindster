import { z } from 'zod'

export const CreateConversationSchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  model: z.string().min(1, 'Model is required'),
  title: z.string().optional(),
})

export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
})

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>
export type SendMessageInput = z.infer<typeof SendMessageSchema>
