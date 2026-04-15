import { get_current_admin } from '@/lib/auth'
import { fail, ok } from '@/lib/http'

export async function GET() {
  const admin = await get_current_admin()
  if (!admin) {
    return fail('Não autenticado', 401, 'nao_autenticado')
  }

  return ok({
    usuario_admin: {
      id: admin.sub,
      nome: admin.nome,
      email: admin.email,
      perfis: admin.perfis,
      is_super_admin: admin.is_super_admin
    }
  })
}
