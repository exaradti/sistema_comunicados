import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE } from '@/lib/auth'
import { ok } from '@/lib/http'

export async function POST() {
  ;(await cookies()).set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  })
  return ok({ mensagem: 'Sessão encerrada' })
}
