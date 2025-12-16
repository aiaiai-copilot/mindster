import { env } from './env'

/**
 * Encryption utilities using Web Crypto API (Bun-compatible)
 * Uses AES-256-GCM for authenticated encryption
 */

// Convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

// Convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Get encryption key from environment
async function getKey(): Promise<CryptoKey> {
  const keyBytes = hexToBytes(env.ENCRYPTION_KEY)
  return crypto.subtle.importKey('raw', keyBytes.buffer as ArrayBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns base64 encoded string containing: iv (12 bytes) + ciphertext + authTag (16 bytes)
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey()
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Encrypt with AES-GCM
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  // Return as base64
  return Buffer.from(combined).toString('base64')
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * Expects base64 encoded string containing: iv (12 bytes) + ciphertext + authTag (16 bytes)
 */
export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getKey()
  const combined = Buffer.from(ciphertext, 'base64')

  // Extract IV and encrypted data
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)

  // Decrypt with AES-GCM
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)

  // Return as string
  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}
