import { eq, and } from 'drizzle-orm'
import { db } from '../../shared/db'
import { providers, type Provider, DEFAULT_BASE_URL } from '../../shared/db/schema'
import { encrypt, decrypt } from '../../shared/lib/crypto'
import type { CreateProviderInput, UpdateProviderInput } from './providers.schemas'

export type ProviderResponse = Omit<Provider, 'apiKeyEncrypted'>

/**
 * Transform provider to response format (without encrypted API key)
 */
function toResponse(provider: Provider): ProviderResponse {
  const { apiKeyEncrypted, ...rest } = provider
  return rest
}

export const providersService = {
  /**
   * Get all providers for a user
   */
  async list(userId: string): Promise<ProviderResponse[]> {
    const userProviders = await db.query.providers.findMany({
      where: eq(providers.userId, userId),
      orderBy: (providers, { desc }) => [desc(providers.createdAt)],
    })

    return userProviders.map(toResponse)
  },

  /**
   * Create a new provider
   */
  async create(userId: string, data: CreateProviderInput): Promise<ProviderResponse> {
    const apiKeyEncrypted = await encrypt(data.apiKey)

    const [provider] = await db
      .insert(providers)
      .values({
        userId,
        name: data.name,
        apiKeyEncrypted,
        baseUrl: data.baseUrl || DEFAULT_BASE_URL,
      })
      .returning()

    return toResponse(provider)
  },

  /**
   * Get a single provider by ID
   */
  async getById(userId: string, id: string): Promise<ProviderResponse | null> {
    const provider = await db.query.providers.findFirst({
      where: and(eq(providers.id, id), eq(providers.userId, userId)),
    })

    if (!provider) {
      return null
    }

    return toResponse(provider)
  },

  /**
   * Get provider with decrypted API key (internal use only)
   */
  async getWithApiKey(userId: string, id: string): Promise<(Provider & { apiKey: string }) | null> {
    const provider = await db.query.providers.findFirst({
      where: and(eq(providers.id, id), eq(providers.userId, userId)),
    })

    if (!provider) {
      return null
    }

    const apiKey = await decrypt(provider.apiKeyEncrypted)
    return { ...provider, apiKey }
  },

  /**
   * Update a provider
   */
  async update(
    userId: string,
    id: string,
    data: UpdateProviderInput
  ): Promise<ProviderResponse | null> {
    // First check if provider exists and belongs to user
    const existing = await db.query.providers.findFirst({
      where: and(eq(providers.id, id), eq(providers.userId, userId)),
    })

    if (!existing) {
      return null
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (data.name !== undefined) {
      updateData.name = data.name
    }

    if (data.apiKey !== undefined) {
      updateData.apiKeyEncrypted = await encrypt(data.apiKey)
    }

    if (data.baseUrl !== undefined) {
      updateData.baseUrl = data.baseUrl
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
    }

    const [updated] = await db
      .update(providers)
      .set(updateData)
      .where(and(eq(providers.id, id), eq(providers.userId, userId)))
      .returning()

    return toResponse(updated)
  },

  /**
   * Delete a provider
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(providers)
      .where(and(eq(providers.id, id), eq(providers.userId, userId)))
      .returning()

    return result.length > 0
  },

  /**
   * Test connection to provider API and return available models
   * All providers use OpenAI-compatible API (OpenRouter default)
   */
  async testConnection(
    userId: string,
    id: string
  ): Promise<{ success: boolean; models?: string[]; error?: string }> {
    const provider = await db.query.providers.findFirst({
      where: and(eq(providers.id, id), eq(providers.userId, userId)),
    })

    if (!provider) {
      return { success: false, error: 'Provider not found' }
    }

    try {
      const apiKey = await decrypt(provider.apiKeyEncrypted)
      const baseUrl = provider.baseUrl || DEFAULT_BASE_URL

      // All providers use OpenAI-compatible /models endpoint
      const url = `${baseUrl}/models`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: `API error: ${response.status} ${response.statusText} - ${errorText}`,
        }
      }

      const data = await response.json()
      const models = data.data?.map((m: { id: string }) => m.id) || []

      return { success: true, models }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}
