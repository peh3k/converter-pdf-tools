import { validateFileSize, sanitizeFileName, securityHeaders, validateMimeType } from '@/lib/security'

describe('Security', () => {
  describe('validateFileSize', () => {
    it('accepts files under the limit', () => {
      expect(validateFileSize(1024)).toBe(true)
    })

    it('accepts files at the limit', () => {
      const maxSize = 50 * 1024 * 1024 // 50MB default
      expect(validateFileSize(maxSize)).toBe(true)
    })

    it('rejects files over the limit', () => {
      const overLimit = 51 * 1024 * 1024
      expect(validateFileSize(overLimit)).toBe(false)
    })
  })

  describe('sanitizeFileName', () => {
    it('keeps valid file names unchanged', () => {
      expect(sanitizeFileName('document.pdf')).toBe('document.pdf')
    })

    it('replaces special characters', () => {
      const result = sanitizeFileName('my file (1).pdf')
      expect(result).not.toContain(' ')
      expect(result).not.toContain('(')
      expect(result).not.toContain(')')
    })

    it('prevents path traversal', () => {
      const result = sanitizeFileName('../../../etc/passwd')
      expect(result).not.toContain('..')
    })

    it('truncates long file names', () => {
      const longName = 'a'.repeat(300) + '.pdf'
      expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255)
    })

    it('handles empty string', () => {
      expect(sanitizeFileName('')).toBe('')
    })
  })

  describe('securityHeaders', () => {
    it('returns required security headers', () => {
      const headers = securityHeaders()
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff')
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY')
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block')
      expect(headers).toHaveProperty('Referrer-Policy', 'strict-origin-when-cross-origin')
      expect(headers).toHaveProperty('Permissions-Policy')
    })
  })

  describe('validateMimeType', () => {
    it('accepts PDF files', () => {
      expect(validateMimeType('application/pdf')).toBe(true)
    })

    it('accepts JPEG files', () => {
      expect(validateMimeType('image/jpeg')).toBe(true)
    })

    it('accepts PNG files', () => {
      expect(validateMimeType('image/png')).toBe(true)
    })

    it('accepts Excel files', () => {
      expect(validateMimeType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true)
    })

    it('rejects executable files', () => {
      expect(validateMimeType('application/x-executable')).toBe(false)
    })

    it('rejects script files', () => {
      expect(validateMimeType('application/javascript')).toBe(false)
    })

    it('rejects HTML files', () => {
      expect(validateMimeType('text/html')).toBe(false)
    })
  })
})
