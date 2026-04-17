import { require_admin } from '@/lib/auth'
import { obter_comunicado } from '@/lib/comunicados'
import { fail, ok } from '@/lib/http'

export async function GET(_: Request, context: any) {
  try {
    await require_admin()
    return ok(await obter_comunicado(Number(context.params.id)))
  } catch (e: any) {
    return fail(e.message || 'Erro ao obter comunicado', e.message === 'não autenticado' ? 401 : 400)
  }
}
