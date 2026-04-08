import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, validateFileSize, securityHeaders } from '@/lib/security'
import { compressPDF } from '@/lib/pdf-operations'

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Envie um arquivo PDF' }, { status: 400 })
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json({ error: 'Arquivo excede o tamanho máximo' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await compressPDF(buffer)

    return new NextResponse(new Uint8Array(result), {
      headers: {
        ...securityHeaders(),
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed_${file.name}"`,
        'X-Original-Size': file.size.toString(),
        'X-Compressed-Size': result.length.toString(),
      }
    })
  } catch (error) {
    console.error('Compress error:', error)
    return NextResponse.json({ error: 'Erro ao comprimir PDF' }, { status: 500 })
  }
}
