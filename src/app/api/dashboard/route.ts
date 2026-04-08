import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const conversions = await prisma.conversion.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const stats = await prisma.conversion.groupBy({
    by: ['type'],
    where: { userId: user.id },
    _count: { type: true },
  })

  const totalConversions = await prisma.conversion.count({
    where: { userId: user.id },
  })

  return NextResponse.json({
    user,
    conversions,
    stats,
    totalConversions,
  })
}
