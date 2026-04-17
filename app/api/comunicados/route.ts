import { NextRequest } from 'next/server'
import { require_admin } from '@/lib/auth'
import { criar_comunicado, listar_comunicados } from '@/lib/comunicados'
import { fail, get_json, ok } from '@/lib/http'
import { comunicado_assinatura_criacao_schema, comunicado_email_schema } from '@/lib/validators'

export async function GET() {
  try {
    await require_admin()
    return ok(await listar_comunicados())
  } catch (e: any) {
    return fail(e.message || 'Erro ao listar comunicados', e.message === 'não autenticado' ? 401 : 400)
  }
}

export async function POST(request: NextRequest) {
  try {
    await require_admin()
    const body = await get_json<any>(request)
    const payload = body.tipo_confirmacao === 'assinatura'
      ? comunicado_assinatura_criacao_schema.parse(body)
      : comunicado_email_schema.parse(body)

    return ok(await criar_comunicado(payload), 201)
  } catch (e: any) {
    return fail(e.message || 'Erro ao criar comunicado', e.name === 'ZodError' ? 422 : 400)
  }
}
