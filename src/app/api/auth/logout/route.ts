import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  const cookie = clearAuthCookie()
  const response = NextResponse.json({ message: 'Logout realizado com sucesso' })
  response.cookies.set(cookie.name, cookie.value, cookie.options as any)
  return response
}
