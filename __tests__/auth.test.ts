jest.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  },
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ get: jest.fn() })),
}))

import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth'

describe('Auth', () => {
  describe('hashPassword', () => {
    it('hashes a password', async () => {
      const hash = await hashPassword('mypassword123')
      expect(hash).toBeTruthy()
      expect(hash).not.toBe('mypassword123')
    })

    it('generates different hashes for same password', async () => {
      const hash1 = await hashPassword('mypassword123')
      const hash2 = await hashPassword('mypassword123')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('verifies correct password', async () => {
      const hash = await hashPassword('mypassword123')
      const isValid = await verifyPassword('mypassword123', hash)
      expect(isValid).toBe(true)
    })

    it('rejects incorrect password', async () => {
      const hash = await hashPassword('mypassword123')
      const isValid = await verifyPassword('wrongpassword', hash)
      expect(isValid).toBe(false)
    })
  })

  describe('generateToken / verifyToken', () => {
    it('generates a valid token', () => {
      const token = generateToken('user-123')
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })

    it('verifies a valid token', () => {
      const token = generateToken('user-123')
      const payload = verifyToken(token)
      expect(payload).not.toBeNull()
      expect(payload?.userId).toBe('user-123')
    })

    it('rejects an invalid token', () => {
      const payload = verifyToken('invalid-token')
      expect(payload).toBeNull()
    })

    it('rejects a tampered token', () => {
      const token = generateToken('user-123')
      const tampered = token + 'x'
      const payload = verifyToken(tampered)
      expect(payload).toBeNull()
    })
  })
})
