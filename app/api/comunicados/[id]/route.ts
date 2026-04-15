import { fail, ok } from '@/lib/http'
import { obter_comunicado } from '@/lib/comunicados'
import { require_admin } from '@/lib/auth'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await require_admin()
    const { id } = await params
    return ok(await obter_comunicado(Number(id)))
  } catch (e: any) {
    return fail(
      e.message || 'Erro ao obter comunicado',
      e.message === 'não autenticado' ? 401 : 400
    )
  }
}
