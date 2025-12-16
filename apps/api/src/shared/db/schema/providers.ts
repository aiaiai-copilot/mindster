import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

// Default to OpenRouter API (OpenAI-compatible gateway for all models)
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'

export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  apiKeyEncrypted: text('api_key_encrypted').notNull(),
  baseUrl: text('base_url').default(DEFAULT_BASE_URL).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export { DEFAULT_BASE_URL }

export type Provider = typeof providers.$inferSelect
export type NewProvider = typeof providers.$inferInsert
