# Skill: Create Database Migration

Create a new Drizzle migration for schema changes.

## Input Required

1. **Change type**: new table | add column | modify column | add index | drop
2. **Table name**: e.g., "users", "chats", "providers"
3. **Description**: What changes are needed

## Procedure

### Step 1: Update Drizzle schema

Edit `apps/api/src/shared/db/schema/{table}.ts`:

**New table:**
```typescript
// schema/providers.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  endpoint: text('endpoint').notNull(),
  apiKeyEncrypted: text('api_key_encrypted').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Provider = typeof providers.$inferSelect
export type NewProvider = typeof providers.$inferInsert
```

**Add column:**
```typescript
// Add to existing table definition
isActive: boolean('is_active').default(true).notNull(),
```

### Step 2: Export from schema index

```typescript
// schema/index.ts
export * from './users'
export * from './providers'
export * from './chats'
```

### Step 3: Generate migration

```bash
bun run db:generate
```

This creates a migration file in `apps/api/src/shared/db/migrations/`

### Step 4: Review migration

Check the generated SQL:
- Correct table/column names
- Proper constraints
- No data loss (for modifications)

### Step 5: Run migration

```bash
bun run db:migrate
```

### Step 6: Update types (if needed)

If adding relations, update Drizzle relations:

```typescript
// schema/relations.ts
import { relations } from 'drizzle-orm'
import { users } from './users'
import { providers } from './providers'

export const usersRelations = relations(users, ({ many }) => ({
  providers: many(providers),
}))

export const providersRelations = relations(providers, ({ one }) => ({
  user: one(users, {
    fields: [providers.userId],
    references: [users.id],
  }),
}))
```

## Required Columns

**EVERY table with user data MUST have:**
```typescript
userId: uuid('user_id').notNull().references(() => users.id),
```

**Standard timestamps:**
```typescript
createdAt: timestamp('created_at').defaultNow().notNull(),
updatedAt: timestamp('updated_at').defaultNow().notNull(),
```

## Common Patterns

**Soft delete:**
```typescript
deletedAt: timestamp('deleted_at'),
```

**Enum column:**
```typescript
import { pgEnum } from 'drizzle-orm/pg-core'

export const statusEnum = pgEnum('status', ['active', 'inactive', 'pending'])

// In table:
status: statusEnum('status').default('active').notNull(),
```

**JSON column:**
```typescript
import { jsonb } from 'drizzle-orm/pg-core'

metadata: jsonb('metadata').$type<{ key: string }>(),
```

## Checklist

- [ ] Schema file updated
- [ ] Exported from schema/index.ts
- [ ] `user_id` included (if user data)
- [ ] Timestamps included
- [ ] Migration generated
- [ ] Migration reviewed
- [ ] Migration applied
- [ ] Relations updated (if needed)
- [ ] Types exported
