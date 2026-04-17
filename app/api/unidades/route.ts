import { NextRequest } from 'next/server'
import { criar_basico, listar_basico } from '@/lib/admin_crud'
import { require_admin } from '@/lib/auth'
import { fail, get_json, ok } from '@/lib/http'
import { unidade_schema } from '@/lib/validators'

export async function GET() {
  try {
    await require_admin()
    const { data, error } = await listar_basico('unidades')
    if (error) return fail(error.message)
    return ok({ unidades: data || [] })
  } catch {
    return fail('Não autenticado', 401, 'nao_autenticado')
  }
}

export async function POST(request: NextRequest) {
  try {
    await require_admin()
    const body = unidade_schema.parse(await get_json(request))
    const { data, error } = await criar_basico('unidades', body)
    if (error) return fail(error.message)
    return ok({ unidade: data, mensagem: 'Unidade criada com sucesso' }, 201)
  } catch (e: any) {
    return fail(e.message || 'Erro ao criar unidade', e.name === 'ZodError' ? 422 : 400)
  }
}
