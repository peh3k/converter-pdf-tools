import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, validateFileSize, securityHeaders } from '@/lib/security'
import { extractPages } from '@/lib/pdf-operations'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const user = await getCurrentUser()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Envie um arquivo PDF' }, { status: 400 })
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json({ error: 'Arquivo excede o tamanho máximo' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const pages = await extractPages(buffer)

    if (user) {
      await prisma.conversion.create({
        data: {
          userId: user.id,
          type: 'pages',
          inputFileName: file.name,
          outputFileName: `${pages.length}_pages.pdf`,
          fileSize: file.size,
        }
      })
    }

    const encoded = pages.map((buf, i) => ({
      name: `page_${i + 1}.pdf`,
      data: buf.toString('base64'),
    }))

    return NextResponse.json({ files: encoded }, { headers: securityHeaders() })
  } catch (error) {
    console.error('Pages error:', error)
    return NextResponse.json({ error: 'Erro ao dividir páginas' }, { status: 500 })
  }
}
