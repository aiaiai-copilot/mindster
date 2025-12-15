# Skill: Create FSD Component

Create a new component following Feature-Sliced Design architecture.

## Input Required

1. **Layer**: app | pages | widgets | features | entities | shared
2. **Slice name**: e.g., "user-profile", "chat-message"
3. **Component name**: e.g., "UserCard", "MessageList"
4. **Description**: What this component does

## Procedure

### Step 1: Determine correct layer

Ask yourself:
- Is it a full page? → `pages`
- Is it a large self-contained block? → `widgets`
- Is it a user action/interaction? → `features`
- Is it a business entity representation? → `entities`
- Is it a reusable UI element? → `shared/ui`

### Step 2: Create slice structure

For features/entities/widgets:

```
apps/web/src/{layer}/{slice-name}/
├── ui/
│   ├── {ComponentName}.tsx
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
├── index.ts
```

For shared/ui:

```
apps/web/src/shared/ui/{component-name}/
├── {ComponentName}.tsx
└── index.ts
```

### Step 3: Create component file

```tsx
// ui/{ComponentName}.tsx
import { cn } from '@/shared/lib/utils'

interface {ComponentName}Props {
  className?: string
  // ... other props
}

export function {ComponentName}({ className, ...props }: {ComponentName}Props) {
  return (
    <div className={cn('', className)}>
      {/* Component content */}
    </div>
  )
}
```

### Step 4: Create public API

```typescript
// index.ts (slice root)
export { {ComponentName} } from './ui'
export type { {ComponentName}Props } from './ui/{ComponentName}'
```

### Step 5: Verify imports

Check that:
- Component only imports from lower layers
- No cross-slice imports within same layer
- Uses `@/` alias for imports

## Example

**Input:**
- Layer: features
- Slice: send-message
- Component: MessageInput
- Description: Text input with send button for chat

**Output structure:**

```
apps/web/src/features/send-message/
├── ui/
│   ├── MessageInput.tsx
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
└── index.ts
```

## Checklist

- [ ] Correct layer chosen
- [ ] Slice folder created
- [ ] Component follows naming convention
- [ ] Props interface defined
- [ ] Public API exported via index.ts
- [ ] No upward imports
- [ ] Uses Tailwind for styling
- [ ] Uses cn() for conditional classes
