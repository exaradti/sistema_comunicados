import { require_admin } from '@/lib/auth'
import { obter_comunicado } from '@/lib/comunicados'
import { fail, ok } from '@/lib/http'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await require_admin()
    return ok(await obter_comunicado(Number(params.id)))
  } catch (e: any) {
    return fail(e.message || 'Erro ao obter comunicado', e.message === 'não autenticado' ? 401 : 400)
  }
}
