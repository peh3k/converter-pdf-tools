import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, validateFileSize, securityHeaders } from '@/lib/security'
import { pdfToImages, imageToPDF, excelToPDF } from '@/lib/pdf-operations'

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const conversionType = formData.get('type') as string

    if (files.length === 0) {
      return NextResponse.json({ error: 'Envie pelo menos um arquivo' }, { status: 400 })
    }

    for (const file of files) {
      if (!validateFileSize(file.size)) {
        return NextResponse.json({ error: `Arquivo ${file.name} excede o tamanho máximo` }, { status: 400 })
      }
    }

    let result: Buffer | Buffer[]
    let outputName: string
    let contentType: string

    switch (conversionType) {
      case 'pdf-to-jpg': {
        const buffer = Buffer.from(await files[0].arrayBuffer())
        result = await pdfToImages(buffer)
        outputName = 'converted_images'
        contentType = 'application/json'

        const encoded = (result as Buffer[]).map((buf, i) => ({
          name: `page_${i + 1}.jpg`,
          data: buf.toString('base64'),
        }))

        return NextResponse.json({ files: encoded }, { headers: securityHeaders() })
      }

      case 'jpg-to-pdf':
      case 'png-to-pdf':
      case 'webp-to-pdf': {
        const buffers = await Promise.all(
          files.map(async f => Buffer.from(await f.arrayBuffer()))
        )
        result = await imageToPDF(buffers)
        outputName = 'converted.pdf'
        contentType = 'application/pdf'

        return new NextResponse(new Uint8Array(result as Buffer), {
          headers: {
            ...securityHeaders(),
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${outputName}"`,
          }
        })
      }

      case 'excel-to-pdf': {
        const buffer = Buffer.from(await files[0].arrayBuffer())
        result = await excelToPDF(buffer)
        outputName = 'converted.pdf'
        contentType = 'application/pdf'

        return new NextResponse(new Uint8Array(result as Buffer), {
          headers: {
            ...securityHeaders(),
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${outputName}"`,
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Tipo de conversão inválido' }, { status: 400 })
    }
  } catch (error) {
    console.error('Convert error:', error)
    return NextResponse.json({ error: 'Erro ao converter arquivo' }, { status: 500 })
  }
}
