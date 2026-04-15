import { NextRequest } from 'next/server'
import { atualizar_basico } from '@/lib/admin_crud'
import { require_admin } from '@/lib/auth'
import { fail, get_json, ok } from '@/lib/http'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await require_admin()
    const body = await get_json<Record<string, unknown>>(request)
    const { data, error } = await atualizar_basico('unidades', Number(params.id), body)
    if (error) return fail(error.message)
    return ok({ unidade: data, mensagem: 'Unidade atualizada com sucesso' })
  } catch (e: any) {
    return fail(e.message || 'Erro ao atualizar unidade', 400)
  }
}
