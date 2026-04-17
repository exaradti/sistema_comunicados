import { require_admin } from '@/lib/auth'
import { enviar_comunicado } from '@/lib/comunicados'
import { fail, ok } from '@/lib/http'

export async function POST(_: Request, context: any) {
  try {
    await require_admin()
    return ok(await enviar_comunicado(Number(context.params.id)))
  } catch (e: any) {
    return fail(e.message || 'Erro ao enviar comunicado', e.message === 'não autenticado' ? 401 : 400)
  }
}
