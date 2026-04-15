import { get_supabase_admin } from '@/lib/supabase'

export async function registrar_historico(comunicado_id: number, acao: string, descricao: string, dados?: unknown) {
  const supabase = get_supabase_admin()
  await supabase.from('comunicado_historico').insert({
    comunicado_id,
    acao,
    descricao,
    dados: dados ?? null
  })
}
