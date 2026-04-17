import { NextRequest } from 'next/server'
import { confirmar_por_token, obter_confirmacao_por_token } from '@/lib/comunicados'
import { fail, get_request_meta, ok } from '@/lib/http'

export async function GET(_: NextRequest, context: any) {
  try {
    return ok(await obter_confirmacao_por_token(context.params.token))
  } catch (e: any) {
    return fail(e.message || 'Erro ao validar token', 400)
  }
}

export async function POST(request: NextRequest, context: any) {
  try {
    const { ip, user_agent } = get_request_meta(request)
    return ok(await confirmar_por_token(context.params.token, ip, user_agent))
  } catch (e: any) {
    return fail(e.message || 'Erro ao confirmar ciência', 400)
  }
}
