# Skill: Create Backend Module

Scaffold a new feature module in the backend.

## Input Required

1. **Module name**: e.g., "providers", "chats", "settings"
2. **Description**: What this module handles
3. **Main entities**: What database tables it manages

## Procedure

### Step 1: Create module folder structure

```
apps/api/src/modules/{module-name}/
├── routes.ts
├── service.ts
├── repository.ts
├── schema.ts
├── types.ts
├── __tests__/
│   └── {module-name}.test.ts
└── index.ts
```

### Step 2: Create types

```typescript
// types.ts
export interface {Entity} {
  id: string
  userId: string
  // ... fields
  createdAt: Date
  updatedAt: Date
}

export interface Create{Entity}Input {
  // ... fields for creation
}

export interface Update{Entity}Input {
  // ... fields for update (all optional)
}
```

### Step 3: Create Zod schemas

```typescript
// schema.ts
import { z } from 'zod'

export const Create{Entity}Schema = z.object({
  name: z.string().min(1).max(255),
  // ... other fields
})

export const Update{Entity}Schema = Create{Entity}Schema.partial()

export const {Entity}IdSchema = z.object({
  id: z.string().uuid(),
})
```

### Step 4: Create repository

```typescript
// repository.ts
import { eq, and } from 'drizzle-orm'
import { db } from '@/shared/db'
import { {entities} } from '@/shared/db/schema'
import type { Create{Entity}Input, Update{Entity}Input } from './types'

export const {entity}Repository = {
  async findAll(userId: string) {
    return db.query.{entities}.findMany({
      where: eq({entities}.userId, userId),
    })
  },

  async findById(userId: string, id: string) {
    return db.query.{entities}.findFirst({
      where: and(
        eq({entities}.id, id),
        eq({entities}.userId, userId)
      ),
    })
  },

  async create(userId: string, data: Create{Entity}Input) {
    const [result] = await db.insert({entities}).values({
      userId,
      ...data,
    }).returning()
    return result
  },

  async update(userId: string, id: string, data: Update{Entity}Input) {
    const [result] = await db.update({entities})
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq({entities}.id, id),
        eq({entities}.userId, userId)
      ))
      .returning()
    return result
  },

  async delete(userId: string, id: string) {
    await db.delete({entities})
      .where(and(
        eq({entities}.id, id),
        eq({entities}.userId, userId)
      ))
  },
}
```

### Step 5: Create service

```typescript
// service.ts
import { {entity}Repository } from './repository'
import type { Create{Entity}Input, Update{Entity}Input } from './types'

export const {entity}Service = {
  async getAll(userId: string) {
    return {entity}Repository.findAll(userId)
  },

  async getById(userId: string, id: string) {
    const entity = await {entity}Repository.findById(userId, id)
    if (!entity) {
      throw new NotFoundError('{Entity} not found')
    }
    return entity
  },

  async create(userId: string, data: Create{Entity}Input) {
    return {entity}Repository.create(userId, data)
  },

  async update(userId: string, id: string, data: Update{Entity}Input) {
    const entity = await {entity}Repository.findById(userId, id)
    if (!entity) {
      throw new NotFoundError('{Entity} not found')
    }
    return {entity}Repository.update(userId, id, data)
  },

  async delete(userId: string, id: string) {
    const entity = await {entity}Repository.findById(userId, id)
    if (!entity) {
      throw new NotFoundError('{Entity} not found')
    }
    await {entity}Repository.delete(userId, id)
  },
}
```

### Step 6: Create routes

```typescript
// routes.ts
import { FastifyPluginAsync } from 'fastify'
import { {entity}Service } from './service'
import { Create{Entity}Schema, Update{Entity}Schema, {Entity}IdSchema } from './schema'

export const {entity}Routes: FastifyPluginAsync = async (fastify) => {
  // GET /
  fastify.get('/', async (request) => {
    return {entity}Service.getAll(request.user.id)
  })

  // GET /:id
  fastify.get('/:id', {
    schema: { params: {Entity}IdSchema },
  }, async (request) => {
    return {entity}Service.getById(request.user.id, request.params.id)
  })

  // POST /
  fastify.post('/', {
    schema: { body: Create{Entity}Schema },
  }, async (request, reply) => {
    const result = await {entity}Service.create(request.user.id, request.body)
    reply.status(201).send(result)
  })

  // PUT /:id
  fastify.put('/:id', {
    schema: {
      params: {Entity}IdSchema,
      body: Update{Entity}Schema,
    },
  }, async (request) => {
    return {entity}Service.update(request.user.id, request.params.id, request.body)
  })

  // DELETE /:id
  fastify.delete('/:id', {
    schema: { params: {Entity}IdSchema },
  }, async (request, reply) => {
    await {entity}Service.delete(request.user.id, request.params.id)
    reply.status(204).send()
  })
}
```

### Step 7: Create module index

```typescript
// index.ts
import { FastifyPluginAsync } from 'fastify'
import { {entity}Routes } from './routes'

export const {entity}Module: FastifyPluginAsync = async (fastify) => {
  fastify.register({entity}Routes, { prefix: '/{entities}' })
}

export * from './types'
export * from './service'
```

### Step 8: Register module

In `apps/api/src/app.ts`:

```typescript
import { {entity}Module } from './modules/{entities}'

// In app setup:
app.register({entity}Module)
```

### Step 9: Create tests

```typescript
// __tests__/{entities}.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { createTestApp, createTestUser } from '@/test/utils'

describe('{Entity} module', () => {
  let app: FastifyInstance
  let token: string

  beforeAll(async () => {
    app = await createTestApp()
    const user = await createTestUser()
    token = user.token
  })

  describe('GET /{entities}', () => {
    it('returns empty list initially', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/{entities}',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual([])
    })
  })

  // ... more tests
})
```

## Checklist

- [ ] Folder structure created
- [ ] Types defined
- [ ] Zod schemas created
- [ ] Repository with CRUD
- [ ] Service with business logic
- [ ] Routes registered
- [ ] Module exported and registered in app
- [ ] Tests created
- [ ] OpenAPI spec updated (use api-endpoint skill)
