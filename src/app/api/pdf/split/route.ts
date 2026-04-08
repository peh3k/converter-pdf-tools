import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, validateFileSize, securityHeaders } from '@/lib/security'
import { splitPDF } from '@/lib/pdf-operations'

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const rangesStr = formData.get('ranges') as string

    if (!file) {
      return NextResponse.json({ error: 'Envie um arquivo PDF' }, { status: 400 })
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json({ error: 'Arquivo excede o tamanho máximo' }, { status: 400 })
    }

    let ranges: { start: number; end: number }[]
    try {
      ranges = JSON.parse(rangesStr)
    } catch {
      return NextResponse.json({ error: 'Formato de intervalos inválido' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const results = await splitPDF(buffer, ranges)

    // If single result, return PDF directly
    if (results.length === 1) {
      return new NextResponse(new Uint8Array(results[0]), {
        headers: {
          ...securityHeaders(),
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="split_1.pdf"',
        }
      })
    }

    // Multiple results: return as JSON with base64 encoded PDFs
    const encoded = results.map((buf, i) => ({
      name: `split_${i + 1}.pdf`,
      data: buf.toString('base64'),
    }))

    return NextResponse.json({ files: encoded }, { headers: securityHeaders() })
  } catch (error) {
    console.error('Split error:', error)
    return NextResponse.json({ error: 'Erro ao separar PDF' }, { status: 500 })
  }
}
