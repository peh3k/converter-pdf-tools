import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'

export async function combinePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create()

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach(page => mergedPdf.addPage(page))
  }

  const bytes = await mergedPdf.save()
  return Buffer.from(bytes)
}

export async function splitPDF(pdfBuffer: Buffer, ranges: { start: number; end: number }[]): Promise<Buffer[]> {
  const sourcePdf = await PDFDocument.load(pdfBuffer)
  const results: Buffer[] = []

  for (const range of ranges) {
    const newPdf = await PDFDocument.create()
    const pageIndices = []
    for (let i = range.start - 1; i < Math.min(range.end, sourcePdf.getPageCount()); i++) {
      pageIndices.push(i)
    }
    const pages = await newPdf.copyPages(sourcePdf, pageIndices)
    pages.forEach(page => newPdf.addPage(page))
    const bytes = await newPdf.save()
    results.push(Buffer.from(bytes))
  }

  return results
}

export async function extractPages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const sourcePdf = await PDFDocument.load(pdfBuffer)
  const results: Buffer[] = []

  for (let i = 0; i < sourcePdf.getPageCount(); i++) {
    const newPdf = await PDFDocument.create()
    const [page] = await newPdf.copyPages(sourcePdf, [i])
    newPdf.addPage(page)
    const bytes = await newPdf.save()
    results.push(Buffer.from(bytes))
  }

  return results
}

export async function compressPDF(pdfBuffer: Buffer): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true })

  // Remove metadata to reduce size
  pdf.setTitle('')
  pdf.setAuthor('')
  pdf.setSubject('')
  pdf.setKeywords([])
  pdf.setProducer('')
  pdf.setCreator('')

  const bytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  })
  return Buffer.from(bytes)
}

export async function pdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  // We'll use pdf-lib to get page count and dimensions, then render with a canvas approach
  // For server-side, we convert each page to a simple representation
  const pdf = await PDFDocument.load(pdfBuffer)
  const images: Buffer[] = []

  for (let i = 0; i < pdf.getPageCount(); i++) {
    const singlePagePdf = await PDFDocument.create()
    const [page] = await singlePagePdf.copyPages(pdf, [i])
    singlePagePdf.addPage(page)

    const pdfBytes = await singlePagePdf.save()
    // Convert PDF page to image using sharp with PDF support
    try {
      const image = await sharp(Buffer.from(pdfBytes), { density: 150 })
        .jpeg({ quality: 85 })
        .toBuffer()
      images.push(image)
    } catch {
      // If sharp can't handle PDF directly, return the PDF bytes as fallback
      // The client will handle rendering
      images.push(Buffer.from(pdfBytes))
    }
  }

  return images
}

export async function imageToPDF(imageBuffers: Buffer[]): Promise<Buffer> {
  const pdf = await PDFDocument.create()

  for (const imageBuffer of imageBuffers) {
    const metadata = await sharp(imageBuffer).metadata()
    const isJpeg = metadata.format === 'jpeg' || metadata.format === 'jpg'
    const isPng = metadata.format === 'png'

    let img
    if (isJpeg) {
      img = await pdf.embedJpg(imageBuffer)
    } else if (isPng) {
      img = await pdf.embedPng(imageBuffer)
    } else {
      // Convert to PNG first
      const pngBuffer = await sharp(imageBuffer).png().toBuffer()
      img = await pdf.embedPng(pngBuffer)
    }

    const page = pdf.addPage([img.width, img.height])
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    })
  }

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}

export async function excelToPDF(excelBuffer: Buffer): Promise<Buffer> {
  // Using xlsx to read Excel, then create a simple PDF representation
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(excelBuffer, { type: 'buffer' })

  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont('Helvetica' as any)

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_csv(sheet)
    const lines = data.split('\n').filter((l: string) => l.trim())

    let page = pdf.addPage([842, 595]) // A4 landscape for tables
    let y = 560
    const fontSize = 8
    const lineHeight = 12

    // Add sheet name as title
    page.drawText(sheetName, { x: 50, y: y, size: 14, font })
    y -= 25

    for (const line of lines) {
      if (y < 40) {
        page = pdf.addPage([842, 595])
        y = 560
      }
      const text = line.substring(0, 120) // Truncate long lines
      page.drawText(text, { x: 50, y, size: fontSize, font })
      y -= lineHeight
    }
  }

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}

export function getPDFPageCount(pdfBuffer: Buffer): Promise<number> {
  return PDFDocument.load(pdfBuffer).then(pdf => pdf.getPageCount())
}
