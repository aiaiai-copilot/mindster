# Skill: Create API Endpoint

Full cycle: OpenAPI → Backend → Frontend hooks.

## Input Required

1. **Resource**: e.g., "chat", "provider", "message"
2. **Operation**: GET (list) | GET (one) | POST | PUT | DELETE
3. **Description**: What this endpoint does
4. **Request body** (if applicable): Fields and types
5. **Response**: Expected response structure

## Procedure

### Step 1: Design OpenAPI spec

Add to `apps/api/openapi.yaml`:

```yaml
paths:
  /resources:
    post:
      operationId: createResource
      tags: [Resource]
      summary: Create a new resource
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateResourceRequest'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Resource'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  schemas:
    CreateResourceRequest:
      type: object
      required: [name]
      properties:
        name:
          type: string
    Resource:
      type: object
      required: [id, name, createdAt]
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        createdAt:
          type: string
          format: date-time
```

### Step 2: Generate API client

Run: `/gen-api`

This creates typed hooks in `apps/web/src/shared/api/generated/`

### Step 3: Create backend module (if new)

Use skill: `new-module` if module doesn't exist.

### Step 4: Implement backend

**Schema** (`apps/api/src/modules/resources/schema.ts`):
```typescript
import { z } from 'zod'

export const CreateResourceSchema = z.object({
  name: z.string().min(1).max(255),
})

export type CreateResourceInput = z.infer<typeof CreateResourceSchema>
```

**Repository** (`repository.ts`):
```typescript
export const resourceRepository = {
  async create(userId: string, data: CreateResourceInput) {
    return db.insert(resources).values({
      id: crypto.randomUUID(),
      userId,
      ...data,
    }).returning()
  },
}
```

**Service** (`service.ts`):
```typescript
export const resourceService = {
  async create(userId: string, data: CreateResourceInput) {
    return resourceRepository.create(userId, data)
  },
}
```

**Routes** (`routes.ts`):
```typescript
export const resourceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', {
    schema: { body: CreateResourceSchema },
    handler: async (request, reply) => {
      const result = await resourceService.create(
        request.user.id,
        request.body
      )
      reply.status(201).send(result)
    },
  })
}
```

### Step 5: Write tests

```typescript
// __tests__/resources.test.ts
describe('POST /resources', () => {
  it('creates a resource', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/resources',
      payload: { name: 'Test' },
      headers: { authorization: `Bearer ${token}` },
    })
    expect(response.statusCode).toBe(201)
  })
})
```

### Step 6: Use in frontend

```tsx
import { useCreateResource } from '@/shared/api/generated'

function CreateResourceForm() {
  const { mutate, isPending } = useCreateResource()

  const handleSubmit = (data: CreateResourceRequest) => {
    mutate({ data })
  }
}
```

## Checklist

- [ ] OpenAPI spec added/updated
- [ ] `/gen-api` executed
- [ ] Zod schema created
- [ ] Repository implemented
- [ ] Service implemented
- [ ] Route implemented
- [ ] Tests written
- [ ] Frontend can use generated hook
