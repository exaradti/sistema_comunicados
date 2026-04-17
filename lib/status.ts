import { get_supabase_admin } from '@/lib/supabase'

export async function atualizar_status_comunicado(comunicado_id: number) {
  const supabase = get_supabase_admin()
  const { data: destinatarios, error } = await supabase
    .from('comunicado_destinatarios')
    .select('status')
    .eq('comunicado_id', comunicado_id)

  if (error) throw error

  const total = destinatarios?.length || 0
  const confirmados = destinatarios?.filter((item) => item.status === 'confirmado').length || 0
  const enviados = destinatarios?.filter((item) => ['enviado', 'visualizado', 'confirmado'].includes(item.status)).length || 0

  let status = 'rascunho'
  if (total === 0) status = 'rascunho'
  else if (confirmados === total) status = 'confirmado'
  else if (confirmados > 0) status = 'parcialmente_confirmado'
  else if (enviados > 0) status = 'enviado'
  else status = 'aguardando_envio'

  if (confirmados === total && total > 0) {
    await supabase.from('comunicados').update({ status, data_fechamento: new Date().toISOString() }).eq('id', comunicado_id)
  } else {
    await supabase.from('comunicados').update({ status }).eq('id', comunicado_id)
  }
}
