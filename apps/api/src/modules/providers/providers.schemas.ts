import { z } from 'zod'

export const CreateProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url().optional(), // Defaults to OpenRouter
})

export const UpdateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  baseUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type CreateProviderInput = z.infer<typeof CreateProviderSchema>
export type UpdateProviderInput = z.infer<typeof UpdateProviderSchema>
