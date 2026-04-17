import { get_supabase_admin } from '@/lib/supabase'

export async function listar_basico(table: 'funcionarios' | 'setores' | 'unidades') {
  const supabase = get_supabase_admin()
  return supabase.from(table).select('*').order('id', { ascending: true })
}

export async function criar_basico(table: 'funcionarios' | 'setores' | 'unidades', payload: Record<string, unknown>) {
  const supabase = get_supabase_admin()
  return supabase.from(table).insert(payload).select().single()
}

export async function atualizar_basico(table: 'funcionarios' | 'setores' | 'unidades', id: number, payload: Record<string, unknown>) {
  const supabase = get_supabase_admin()
  return supabase.from(table).update(payload).eq('id', id).select().single()
}
