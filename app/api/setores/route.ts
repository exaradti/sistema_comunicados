import { NextRequest } from 'next/server'
import { criar_basico, listar_basico } from '@/lib/admin_crud'
import { require_admin } from '@/lib/auth'
import { fail, get_json, ok } from '@/lib/http'
import { setor_schema } from '@/lib/validators'

export async function GET() {
  try {
    await require_admin()
    const { data, error } = await listar_basico('setores')
    if (error) return fail(error.message)
    return ok({ setores: data || [] })
  } catch {
    return fail('Não autenticado', 401, 'nao_autenticado')
  }
}

export async function POST(request: NextRequest) {
  try {
    await require_admin()
    const body = setor_schema.parse(await get_json(request))
    const { data, error } = await criar_basico('setores', body)
    if (error) return fail(error.message)
    return ok({ setor: data, mensagem: 'Setor criado com sucesso' }, 201)
  } catch (e: any) {
    return fail(e.message || 'Erro ao criar setor', e.name === 'ZodError' ? 422 : 400)
  }
}
