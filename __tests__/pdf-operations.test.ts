import { PDFDocument } from 'pdf-lib'
import { combinePDFs, splitPDF, extractPages, compressPDF, getPDFPageCount } from '@/lib/pdf-operations'

async function createTestPDF(pageCount: number = 1): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.addPage([612, 792])
    const font = await pdf.embedFont('Helvetica' as any)
    page.drawText(`Page ${i + 1}`, { x: 50, y: 700, size: 30, font })
  }
  const bytes = await pdf.save()
  return Buffer.from(bytes)
}

describe('PDF Operations', () => {
  describe('combinePDFs', () => {
    it('combines two PDFs into one', async () => {
      const pdf1 = await createTestPDF(2)
      const pdf2 = await createTestPDF(3)

      const result = await combinePDFs([pdf1, pdf2])
      const pageCount = await getPDFPageCount(result)

      expect(pageCount).toBe(5)
    })

    it('combines a single PDF', async () => {
      const pdf1 = await createTestPDF(1)
      const pdf2 = await createTestPDF(1)

      const result = await combinePDFs([pdf1, pdf2])
      expect(result).toBeInstanceOf(Buffer)

      const pageCount = await getPDFPageCount(result)
      expect(pageCount).toBe(2)
    })
  })

  describe('splitPDF', () => {
    it('splits a PDF by ranges', async () => {
      const pdf = await createTestPDF(6)
      const results = await splitPDF(pdf, [
        { start: 1, end: 3 },
        { start: 4, end: 6 },
      ])

      expect(results).toHaveLength(2)

      const count1 = await getPDFPageCount(results[0])
      const count2 = await getPDFPageCount(results[1])
      expect(count1).toBe(3)
      expect(count2).toBe(3)
    })

    it('handles single page range', async () => {
      const pdf = await createTestPDF(5)
      const results = await splitPDF(pdf, [{ start: 2, end: 2 }])

      expect(results).toHaveLength(1)
      const count = await getPDFPageCount(results[0])
      expect(count).toBe(1)
    })
  })

  describe('extractPages', () => {
    it('extracts individual pages', async () => {
      const pdf = await createTestPDF(4)
      const pages = await extractPages(pdf)

      expect(pages).toHaveLength(4)
      for (const page of pages) {
        const count = await getPDFPageCount(page)
        expect(count).toBe(1)
      }
    })

    it('handles single page PDF', async () => {
      const pdf = await createTestPDF(1)
      const pages = await extractPages(pdf)

      expect(pages).toHaveLength(1)
    })
  })

  describe('compressPDF', () => {
    it('compresses a PDF', async () => {
      const pdf = await createTestPDF(3)
      const compressed = await compressPDF(pdf)

      expect(compressed).toBeInstanceOf(Buffer)
      expect(compressed.length).toBeGreaterThan(0)
    })

    it('returns valid PDF', async () => {
      const pdf = await createTestPDF(2)
      const compressed = await compressPDF(pdf)

      const pageCount = await getPDFPageCount(compressed)
      expect(pageCount).toBe(2)
    })
  })

  describe('getPDFPageCount', () => {
    it('returns correct page count', async () => {
      const pdf = await createTestPDF(7)
      const count = await getPDFPageCount(pdf)
      expect(count).toBe(7)
    })
  })
})
