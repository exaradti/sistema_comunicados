import { NextRequest } from 'next/server'
import { fail, get_json, ok } from '@/lib/http'
import { update_unidade } from '@/lib/admin_crud'
import { unidade_schema } from '@/lib/validators'
import { require_admin } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await require_admin()
    const { id } = await params
    const body = unidade_schema.partial().parse(await get_json(request))
    return ok({ unidade: await update_unidade(Number(id), body) })
  } catch (e: any) {
    return fail(
      e.message || 'Erro ao atualizar unidade',
      e.name === 'ZodError' ? 422 : e.message === 'não autenticado' ? 401 : 400
    )
  }
}
