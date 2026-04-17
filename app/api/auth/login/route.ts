import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE, autenticar_admin, criar_admin_session } from '@/lib/auth'
import { fail, get_json, ok } from '@/lib/http'

export async function POST(request: NextRequest) {
  try {
    const body = await get_json<{ email: string; password: string }>(request)
    const session = await autenticar_admin(body.email, body.password)
    if (!session) {
      return fail('Credenciais inválidas', 401, 'nao_autenticado')
    }

    const token = await criar_admin_session(session)
    ;(await cookies()).set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12
    })

    return ok({
      mensagem: 'Autenticado com sucesso',
      usuario_admin: {
        id: session.sub,
        nome: session.nome,
        email: session.email,
        perfis: session.perfis,
        is_super_admin: session.is_super_admin
      }
    })
  } catch (e: any) {
    return fail(e.message || 'Erro ao autenticar', 400)
  }
}
