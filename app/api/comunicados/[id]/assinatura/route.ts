import { NextRequest } from 'next/server'
import { get_request_meta, fail, get_json, ok } from '@/lib/http'
import { registrar_assinatura } from '@/lib/comunicados'
import { comunicado_assinatura_schema } from '@/lib/validators'
import { require_admin } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await require_admin()

    const { id } = await context.params
    const body = comunicado_assinatura_schema.parse(await get_json(request))
    const { ip, user_agent } = get_request_meta(request)

    return ok(await registrar_assinatura(Number(id), body, ip, user_agent))
  } catch (e: any) {
    return fail(
      e.message || 'Erro ao registrar assinatura',
      e.name === 'ZodError' ? 422 : e.message === 'não autenticado' ? 401 : 400
    )
  }
}
