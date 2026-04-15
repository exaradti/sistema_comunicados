import { NextRequest } from 'next/server'
import { fail, get_json, ok } from '@/lib/http'
import { update_setor } from '@/lib/admin_crud'
import { setor_schema } from '@/lib/validators'
import { require_admin } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await require_admin()
    const { id } = await params
    const body = setor_schema.partial().parse(await get_json(request))
    return ok({ setor: await update_setor(Number(id), body) })
  } catch (e: any) {
    return fail(
      e.message || 'Erro ao atualizar setor',
      e.name === 'ZodError' ? 422 : e.message === 'não autenticado' ? 401 : 400
    )
  }
}
