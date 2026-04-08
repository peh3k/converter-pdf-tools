import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, validateFileSize, securityHeaders } from '@/lib/security'
import { combinePDFs } from '@/lib/pdf-operations'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const user = await getCurrentUser()

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length < 2) {
      return NextResponse.json({ error: 'Envie pelo menos 2 arquivos PDF' }, { status: 400 })
    }

    const buffers: Buffer[] = []
    for (const file of files) {
      if (!validateFileSize(file.size)) {
        return NextResponse.json({ error: `Arquivo ${file.name} excede o tamanho máximo` }, { status: 400 })
      }
      const arrayBuffer = await file.arrayBuffer()
      buffers.push(Buffer.from(arrayBuffer))
    }

    const result = await combinePDFs(buffers)

    if (user) {
      await prisma.conversion.create({
        data: {
          userId: user.id,
          type: 'combine',
          inputFileName: files.map(f => f.name).join(', '),
          outputFileName: 'combined.pdf',
          fileSize: result.length,
        }
      })
    }

    return new NextResponse(new Uint8Array(result), {
      headers: {
        ...securityHeaders(),
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="combined.pdf"',
      }
    })
  } catch (error) {
    console.error('Combine error:', error)
    return NextResponse.json({ error: 'Erro ao combinar PDFs' }, { status: 500 })
  }
}
