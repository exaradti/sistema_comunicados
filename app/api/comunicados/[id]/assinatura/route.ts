import { NextRequest } from 'next/server'
import { get_request_meta, fail, get_json, ok } from '@/lib/http'
import { registrar_assinatura } from '@/lib/comunicados'
import { comunicado_assinatura_schema } from '@/lib/validators'
import { get_current_admin } from '@/lib/auth'
import { get_supabase_admin } from '@/lib/supabase'

export async function POST(request: NextRequest, context: any) {
  try {
    const body = comunicado_assinatura_schema.parse(await get_json(request))
    const { ip, user_agent } = get_request_meta(request)
    const comunicado_id = Number(context.params.id)

    let comunicado_destinatario_id = body.comunicado_destinatario_id
    const admin = await get_current_admin()

    if (!admin?.sub) {
      if (!body.token_confirmacao) {
        return fail('Não autenticado', 401, 'nao_autenticado')
      }

      const supabase = get_supabase_admin()
      const { data: destinatario, error } = await supabase
        .from('comunicado_destinatarios')
        .select('id, comunicado_id, metodo_confirmacao, token_confirmacao, token_expira_em, token_utilizado_em')
        .eq('token_confirmacao', body.token_confirmacao)
        .maybeSingle()

      if (error) return fail(error.message, 400)
      if (!destinatario || destinatario.comunicado_id !== comunicado_id) {
        return fail('Token inválido para assinatura', 400, 'token_invalido')
      }
      if (destinatario.metodo_confirmacao !== 'assinatura') {
        return fail('Método de confirmação inválido', 400, 'metodo_invalido')
      }
      if (destinatario.token_utilizado_em) {
        return fail('Token já utilizado', 400, 'token_utilizado')
      }
      if (destinatario.token_expira_em && new Date(destinatario.token_expira_em).getTime() < Date.now()) {
        return fail('Token expirado', 400, 'token_expirado')
      }

      comunicado_destinatario_id = destinatario.id
    }

    if (!comunicado_destinatario_id) {
      return fail('Destinatário inválido para assinatura', 400, 'destinatario_invalido')
    }

    return ok(await registrar_assinatura(comunicado_id, {
      comunicado_destinatario_id,
      nome_assinante: body.nome_assinante,
      assinatura_base64: body.assinatura_base64
    }, ip, user_agent))
  } catch (e: any) {
    return fail(e.message || 'Erro ao registrar assinatura', e.name === 'ZodError' ? 422 : 400)
  }
}
