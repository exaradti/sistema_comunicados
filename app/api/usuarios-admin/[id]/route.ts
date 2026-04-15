import { NextRequest } from 'next/server'
import { fail, get_json, ok } from '@/lib/http'
import { require_super_admin } from '@/lib/auth'
import { atualizar_usuario_admin, obter_usuario_admin } from '@/lib/usuarios_admin'
import { usuario_admin_atualizacao_schema } from '@/lib/validators_admin'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await require_super_admin()
    const { id } = await params
    return ok({ usuario_admin: await obter_usuario_admin(id) })
  } catch (e: any) {
    return fail(e.message || 'Erro ao obter usuário admin', e.message === 'acesso_negado' ? 403 : 400, e.message === 'acesso_negado' ? 'acesso_negado' : 'erro_requisicao')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await require_super_admin()
    const { id } = await params
    const body = usuario_admin_atualizacao_schema.parse(await get_json(request))
    const usuario_admin = await atualizar_usuario_admin(id, body)
    return ok({ usuario_admin, mensagem: 'Usuário admin atualizado com sucesso' })
  } catch (e: any) {
    return fail(e.message || 'Erro ao atualizar usuário admin', e.name === 'ZodError' ? 422 : e.message === 'acesso_negado' ? 403 : 400, e.message === 'acesso_negado' ? 'acesso_negado' : 'erro_requisicao')
  }
}
