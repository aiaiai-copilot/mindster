// Common types shared between apps

export interface ApiResponse<T> {
  data: T
  success: boolean
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Base entity with common fields
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// User-scoped entity
export interface UserScopedEntity extends BaseEntity {
  userId: string
}
