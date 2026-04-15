import { NextRequest, NextResponse } from 'next/server'

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(mensagem: string, status = 400, erro = 'erro_requisicao') {
  return NextResponse.json({ erro, mensagem }, { status })
}

export async function get_json<T>(request: NextRequest): Promise<T> {
  return request.json()
}

export function get_request_meta(request: NextRequest) {
  return {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null,
    user_agent: request.headers.get('user-agent') || null
  }
}
