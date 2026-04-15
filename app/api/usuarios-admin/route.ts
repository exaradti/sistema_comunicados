import { NextRequest } from 'next/server'
import { fail, get_json, ok } from '@/lib/http'
import { require_super_admin } from '@/lib/auth'
import { criar_usuario_admin, listar_usuarios_admin } from '@/lib/usuarios_admin'
import { usuario_admin_criacao_schema } from '@/lib/validators_admin'

export async function GET() {
  try {
    await require_super_admin()
    return ok({ usuarios_admin: await listar_usuarios_admin() })
  } catch (e: any) {
    return fail(e.message === 'acesso_negado' ? 'Acesso negado' : 'Não autenticado', e.message === 'acesso_negado' ? 403 : 401, e.message === 'acesso_negado' ? 'acesso_negado' : 'nao_autenticado')
  }
}

export async function POST(request: NextRequest) {
  try {
    await require_super_admin()
    const body = usuario_admin_criacao_schema.parse(await get_json(request))
    const usuario_admin = await criar_usuario_admin(body)
    return ok({ usuario_admin, mensagem: 'Usuário admin criado com sucesso' }, 201)
  } catch (e: any) {
    return fail(e.message || 'Erro ao criar usuário admin', e.name === 'ZodError' ? 422 : e.message === 'acesso_negado' ? 403 : 400, e.message === 'acesso_negado' ? 'acesso_negado' : 'erro_requisicao')
  }
}
