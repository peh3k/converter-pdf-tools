import { formatFileSize, formatDate, toolsList, cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('merges tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })

  describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })

    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes')
    })

    it('formats KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
    })

    it('formats MB', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
    })

    it('formats GB', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('formats with decimals', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })
  })

  describe('formatDate', () => {
    it('formats a date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('formats a Date object', () => {
      const result = formatDate(new Date('2024-06-20'))
      expect(result).toBeTruthy()
    })
  })

  describe('toolsList', () => {
    it('contains expected tools', () => {
      expect(toolsList.length).toBeGreaterThanOrEqual(9)
    })

    it('each tool has required properties', () => {
      toolsList.forEach(tool => {
        expect(tool).toHaveProperty('id')
        expect(tool).toHaveProperty('title')
        expect(tool).toHaveProperty('description')
        expect(tool).toHaveProperty('icon')
        expect(tool).toHaveProperty('color')
        expect(tool).toHaveProperty('accept')
        expect(tool).toHaveProperty('multiple')
      })
    })

    it('has combine tool', () => {
      const combine = toolsList.find(t => t.id === 'combine')
      expect(combine).toBeDefined()
      expect(combine?.multiple).toBe(true)
    })

    it('has compress tool', () => {
      const compress = toolsList.find(t => t.id === 'compress')
      expect(compress).toBeDefined()
      expect(compress?.multiple).toBe(false)
    })
  })
})
