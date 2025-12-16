import { hash, verify } from '@node-rs/argon2'
import { SignJWT, jwtVerify } from 'jose'
import { eq, count } from 'drizzle-orm'
import { db } from '../../shared/db'
import { users, type User } from '../../shared/db/schema/users'
import { env } from '../../shared/lib/env'
import type { RegisterInput, LoginInput } from './auth.schemas'

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  token: string
}

export interface JWTPayload {
  userId: string
  email: string
  [key: string]: unknown
}

class AuthService {
  private readonly jwtSecret = new TextEncoder().encode(env.JWT_SECRET)

  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if any users exist
    const [userCount] = await db.select({ count: count() }).from(users)

    if (userCount.count > 0) {
      throw new Error('Registration is closed. Admin already exists.')
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const passwordHash = await hash(input.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    // Create admin user (first user is always admin)
    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        name: input.name,
        isAdmin: true,
      })
      .returning()

    const token = await this.generateToken({
      userId: newUser.id,
      email: newUser.email,
    })

    const { passwordHash: _, ...userWithoutPassword } = newUser

    return {
      user: userWithoutPassword,
      token,
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isValidPassword = await verify(user.passwordHash, input.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    const token = await this.generateToken({
      userId: user.id,
      email: user.email,
    })

    const { passwordHash: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return null
    }

    const { passwordHash: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  async generateToken(payload: JWTPayload): Promise<string> {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN)
      .sign(this.jwtSecret)

    return token
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret)
      return payload as JWTPayload
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }
}

export const authService = new AuthService()
