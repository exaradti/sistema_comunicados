import { NextRequest } from 'next/server'
import { fail, get_request_meta, ok } from '@/lib/http'
import { confirmar_por_token, obter_confirmacao_por_token } from '@/lib/comunicados'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    return ok(await obter_confirmacao_por_token(token))
  } catch (e: any) {
    return fail(e.message || 'Erro ao obter confirmação', 400)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { ip, user_agent } = get_request_meta(request)
    return ok(await confirmar_por_token(token, ip, user_agent))
  } catch (e: any) {
    return fail(e.message || 'Erro ao confirmar por token', 400)
  }
}
