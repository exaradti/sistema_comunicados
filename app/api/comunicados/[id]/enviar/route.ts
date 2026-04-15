import { fail, ok } from '@/lib/http'
import { enviar_comunicado } from '@/lib/comunicados'
import { require_admin } from '@/lib/auth'

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await require_admin()
    const { id } = await params
    return ok(await enviar_comunicado(Number(id)))
  } catch (e: any) {
    return fail(
      e.message || 'Erro ao enviar comunicado',
      e.message === 'não autenticado' ? 401 : 400
    )
  }
}
