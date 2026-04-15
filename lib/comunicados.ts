import { get_supabase_admin } from '@/lib/supabase'
import { gerar_hash_conteudo } from '@/lib/hash'
import { gerar_token_confirmacao } from '@/lib/token'
import { registrar_historico } from '@/lib/history'
import { atualizar_status_comunicado } from '@/lib/status'
import { send_email } from '@/lib/email'
import { get_env } from '@/lib/env'

function valid_email(email: string | null | undefined) {
  return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function criar_comunicado(payload: any) {
  const supabase = get_supabase_admin()
  const hash_conteudo = gerar_hash_conteudo(payload.conteudo)

  const { data: comunicado, error: comunicado_error } = await supabase
    .from('comunicados')
    .insert({
      titulo: payload.titulo,
      categoria: payload.categoria,
      conteudo: payload.conteudo,
      setor_origem_id: payload.setor_origem_id,
      responsavel_nome: payload.responsavel_nome,
      responsavel_email: payload.responsavel_email,
      tipo_confirmacao: payload.tipo_confirmacao,
      status: 'rascunho',
      hash_conteudo,
      data_criacao: new Date().toISOString()
    })
    .select()
    .single()

  if (comunicado_error) throw comunicado_error

  let destinatarios_insert: any[] = []
  let duplicados_removidos: number[] = []
  let destinatarios_sem_email: any[] = []

  if (payload.tipo_confirmacao === 'assinatura') {
    const { data: funcionario, error } = await supabase.from('funcionarios').select('*').eq('id', payload.funcionario_id).eq('ativo', true).single()
    if (error || !funcionario) throw new Error('funcionário inválido para assinatura')

    destinatarios_insert = [{
      comunicado_id: comunicado.id,
      funcionario_id: funcionario.id,
      setor_id: funcionario.setor_id,
      unidade_id: funcionario.unidade_id,
      status: 'pendente',
      metodo_confirmacao: 'assinatura',
      origem_destinatario: 'individual'
    }]
  }

  if (payload.tipo_confirmacao === 'email') {
    const selecionados = new Map<number, any>()

    if (payload.funcionarios_ids?.length) {
      const { data } = await supabase.from('funcionarios').select('*').in('id', payload.funcionarios_ids)
      for (const item of data || []) {
        if (selecionados.has(item.id)) duplicados_removidos.push(item.id)
        selecionados.set(item.id, { ...item, origem_destinatario: 'selecao_manual' })
      }
    }

    if (payload.setores_ids?.length) {
      const { data } = await supabase.from('funcionarios').select('*').in('setor_id', payload.setores_ids)
      for (const item of data || []) {
        if (selecionados.has(item.id)) duplicados_removidos.push(item.id)
        else selecionados.set(item.id, { ...item, origem_destinatario: 'setor' })
      }
    }

    for (const funcionario of selecionados.values()) {
      if (!funcionario.ativo) continue
      if (!valid_email(funcionario.email)) {
        destinatarios_sem_email.push({ funcionario_id: funcionario.id, nome: funcionario.nome, email: funcionario.email })
        continue
      }

      destinatarios_insert.push({
        comunicado_id: comunicado.id,
        funcionario_id: funcionario.id,
        setor_id: funcionario.setor_id,
        unidade_id: funcionario.unidade_id,
        status: 'pendente',
        metodo_confirmacao: 'email',
        token_confirmacao: gerar_token_confirmacao(),
        token_expira_em: new Date(Date.now() + Number(get_env('TOKEN_EXPIRATION_HOURS', '168')) * 60 * 60 * 1000).toISOString(),
        origem_destinatario: funcionario.origem_destinatario
      })
    }
  }

  if (destinatarios_insert.length) {
    const { error } = await supabase.from('comunicado_destinatarios').insert(destinatarios_insert)
    if (error) throw error
  }

  await registrar_historico(comunicado.id, 'criado', 'Comunicado criado', { tipo_confirmacao: payload.tipo_confirmacao })
  await registrar_historico(comunicado.id, 'destinatarios_processados', 'Destinatários processados', {
    total_destinatarios: destinatarios_insert.length,
    duplicados_removidos: Array.from(new Set(duplicados_removidos)),
    destinatarios_sem_email
  })
  await atualizar_status_comunicado(comunicado.id)

  const { data: destinatarios } = await supabase.from('comunicado_destinatarios').select('*').eq('comunicado_id', comunicado.id)

  return {
    comunicado,
    destinatarios: destinatarios || [],
    anexos: [],
    mensagem: 'Comunicado criado com sucesso',
    duplicados_removidos: Array.from(new Set(duplicados_removidos)),
    destinatarios_sem_email
  }
}

export async function listar_comunicados() {
  const supabase = get_supabase_admin()
  const { data, error } = await supabase.from('vw_comunicados_resumo').select('*').order('id', { ascending: false })
  if (error) throw error
  return { comunicados: data || [] }
}

export async function obter_comunicado(id: number) {
  const supabase = get_supabase_admin()
  const [{ data: comunicado, error: ec }, { data: destinatarios, error: ed }, { data: anexos, error: ea }] = await Promise.all([
    supabase.from('comunicados').select('*').eq('id', id).single(),
    supabase.from('comunicado_destinatarios').select('*, funcionarios(nome, email)').eq('comunicado_id', id).order('id', { ascending: true }),
    supabase.from('comunicado_anexos').select('*').eq('comunicado_id', id).order('id', { ascending: true })
  ])
  if (ec) throw ec
  if (ed) throw ed
  if (ea) throw ea
  return { comunicado, destinatarios: destinatarios || [], anexos: anexos || [] }
}

export async function enviar_comunicado(id: number) {
  const supabase = get_supabase_admin()
  const { data: comunicado, error: comunicado_error } = await supabase.from('comunicados').select('*').eq('id', id).single()
  if (comunicado_error) throw comunicado_error

  const { data: destinatarios, error } = await supabase
    .from('comunicado_destinatarios')
    .select('*, funcionarios(nome, email)')
    .eq('comunicado_id', id)
    .eq('metodo_confirmacao', 'email')

  if (error) throw error

  const app_url = get_env('NEXT_PUBLIC_APP_URL')
  for (const destinatario of destinatarios || []) {
    const email = (destinatario as any).funcionarios?.email
    if (!valid_email(email)) {
      await supabase.from('comunicado_destinatarios').update({ status: 'erro_envio' }).eq('id', destinatario.id)
      await registrar_historico(id, 'erro_envio', 'Falha de envio por email inválido', { comunicado_destinatario_id: destinatario.id })
      continue
    }

    try {
      const link = `${app_url}/confirmacao/${destinatario.token_confirmacao}`
      await send_email({
        to: email,
        subject: `Comunicado: ${comunicado.titulo}`,
        html: `<p>Olá ${(destinatario as any).funcionarios?.nome || ''},</p><p>${comunicado.conteudo}</p><p><a href="${link}">Abrir comunicado</a></p>`
      })

      await supabase.from('comunicado_destinatarios').update({ status: 'enviado', data_envio_email: new Date().toISOString() }).eq('id', destinatario.id)
    } catch (send_error) {
      await supabase.from('comunicado_destinatarios').update({ status: 'erro_envio' }).eq('id', destinatario.id)
      await registrar_historico(id, 'erro_envio', 'Erro ao enviar email', { comunicado_destinatario_id: destinatario.id, erro: String(send_error) })
    }
  }

  await registrar_historico(id, 'enviado', 'Processo de envio executado')
  await supabase.from('comunicados').update({ data_publicacao: new Date().toISOString() }).eq('id', id)
  await atualizar_status_comunicado(id)

  return { mensagem: 'Envio processado com sucesso' }
}

export async function obter_confirmacao_por_token(token: string) {
  const supabase = get_supabase_admin()
  const { data: destinatario, error } = await supabase
    .from('comunicado_destinatarios')
    .select('*, comunicados(*), comunicado_anexos(*)')
    .eq('token_confirmacao', token)
    .maybeSingle()

  if (error) throw error
  if (!destinatario) {
    return { token_status: 'invalido', erro: 'token_invalido', mensagem: 'Token inválido' }
  }

  if (destinatario.token_utilizado_em) {
    return {
      token_status: 'utilizado',
      mensagem: 'Token já utilizado',
      comunicado: { id: (destinatario as any).comunicados.id, titulo: (destinatario as any).comunicados.titulo, conteudo: (destinatario as any).comunicados.conteudo },
      anexos: []
    }
  }

  if (destinatario.token_expira_em && new Date(destinatario.token_expira_em).getTime() < Date.now()) {
    await registrar_historico(destinatario.comunicado_id, 'token_expirado', 'Token expirado', { comunicado_destinatario_id: destinatario.id })
    await supabase.from('comunicado_destinatarios').update({ status: 'expirado' }).eq('id', destinatario.id)
    return { token_status: 'expirado', mensagem: 'Token expirado' }
  }

  if (destinatario.status === 'enviado') {
    await supabase.from('comunicado_destinatarios').update({ status: 'visualizado', data_visualizacao: destinatario.data_visualizacao || new Date().toISOString() }).eq('id', destinatario.id)
    await registrar_historico(destinatario.comunicado_id, 'visualizado', 'Comunicado visualizado', { comunicado_destinatario_id: destinatario.id })
  }

  const { data: anexos } = await supabase.from('comunicado_anexos').select('*').eq('comunicado_id', destinatario.comunicado_id)

  return {
    token_status: 'valido',
    comunicado: {
      id: (destinatario as any).comunicados.id,
      titulo: (destinatario as any).comunicados.titulo,
      conteudo: (destinatario as any).comunicados.conteudo
    },
    destinatario,
    anexos: anexos || []
  }
}

export async function confirmar_por_token(token: string, ip: string | null, user_agent: string | null) {
  const supabase = get_supabase_admin()
  const { data: destinatario, error } = await supabase
    .from('comunicado_destinatarios')
    .select('*, comunicados(*)')
    .eq('token_confirmacao', token)
    .maybeSingle()

  if (error) throw error
  if (!destinatario) throw new Error('token inválido')
  if (destinatario.token_utilizado_em) throw new Error('token já utilizado')
  if (destinatario.token_expira_em && new Date(destinatario.token_expira_em).getTime() < Date.now()) throw new Error('token expirado')

  await supabase.from('comunicado_destinatarios').update({
    status: 'confirmado',
    data_confirmacao: new Date().toISOString(),
    ip_confirmacao: ip,
    user_agent_confirmacao: user_agent,
    token_utilizado_em: new Date().toISOString()
  }).eq('id', destinatario.id)

  await registrar_historico(destinatario.comunicado_id, 'confirmado', 'Confirmação por token registrada', { comunicado_destinatario_id: destinatario.id })
  await atualizar_status_comunicado(destinatario.comunicado_id)

  if ((destinatario as any).comunicados?.responsavel_email) {
    await send_email({
      to: (destinatario as any).comunicados.responsavel_email,
      subject: `Confirmação registrada: ${(destinatario as any).comunicados.titulo}`,
      html: `<p>Uma confirmação foi registrada para o comunicado ${(destinatario as any).comunicados.titulo}.</p>`
    })
  }

  return { mensagem: 'Confirmação registrada com sucesso' }
}

export async function registrar_assinatura(id: number, payload: any, ip: string | null, user_agent: string | null) {
  const supabase = get_supabase_admin()
  const { data: comunicado, error: ec } = await supabase.from('comunicados').select('*').eq('id', id).single()
  if (ec) throw ec
  if (comunicado.tipo_confirmacao !== 'assinatura') throw new Error('comunicado não é do tipo assinatura')

  const { data: destinatarios, error: ed } = await supabase.from('comunicado_destinatarios').select('*').eq('comunicado_id', id)
  if (ed) throw ed
  if ((destinatarios || []).length !== 1) throw new Error('comunicado de assinatura deve ter apenas 1 destinatário')
  const destinatario = destinatarios![0]
  if (destinatario.id !== payload.comunicado_destinatario_id) throw new Error('destinatário inválido para assinatura')

  const { error: assinatura_error } = await supabase.from('comunicado_assinaturas').insert({
    comunicado_destinatario_id: destinatario.id,
    nome_assinante: payload.nome_assinante,
    assinatura_base64: payload.assinatura_base64,
    data_assinatura: new Date().toISOString(),
    ip_assinatura: ip,
    user_agent_assinatura: user_agent
  })
  if (assinatura_error) throw assinatura_error

  await supabase.from('comunicado_destinatarios').update({
    status: 'confirmado',
    data_confirmacao: new Date().toISOString(),
    ip_confirmacao: ip,
    user_agent_confirmacao: user_agent
  }).eq('id', destinatario.id)

  await registrar_historico(id, 'assinatura_realizada', 'Assinatura registrada', { comunicado_destinatario_id: destinatario.id })
  await atualizar_status_comunicado(id)
  await send_email({
    to: comunicado.responsavel_email,
    subject: `Assinatura registrada: ${comunicado.titulo}`,
    html: `<p>A assinatura foi registrada para o comunicado ${comunicado.titulo}.</p>`
  })

  return { mensagem: 'Assinatura registrada com sucesso' }
}
