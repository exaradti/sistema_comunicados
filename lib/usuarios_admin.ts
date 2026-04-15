import { get_supabase_admin } from '@/lib/supabase'
import { gerar_senha_hash } from '@/lib/hash_password'

async function garantir_perfis(perfis: string[]) {
  const supabase = get_supabase_admin()
  for (const nome of perfis) {
    const { error } = await supabase
      .from('perfis_admin')
      .upsert({ nome, ativo: true }, { onConflict: 'nome' })
    if (error) throw error
  }
}

export async function listar_usuarios_admin() {
  const supabase = get_supabase_admin()
  const { data, error } = await supabase
    .from('usuarios_admin')
    .select(`
      id,
      nome,
      email,
      ativo,
      created_at,
      updated_at,
      usuarios_admin_perfis(
        perfis_admin(nome)
      ),
      usuarios_admin_setores(setor_id),
      usuarios_admin_unidades(unidade_id)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    nome: item.nome,
    email: item.email,
    ativo: item.ativo,
    created_at: item.created_at,
    updated_at: item.updated_at,
    perfis: (item.usuarios_admin_perfis || []).map((p: any) => p.perfis_admin?.nome).filter(Boolean),
    setores_ids: (item.usuarios_admin_setores || []).map((s: any) => s.setor_id),
    unidades_ids: (item.usuarios_admin_unidades || []).map((u: any) => u.unidade_id)
  }))
}

export async function obter_usuario_admin(id: string) {
  const supabase = get_supabase_admin()
  const { data, error } = await supabase
    .from('usuarios_admin')
    .select(`
      id,
      nome,
      email,
      ativo,
      created_at,
      updated_at,
      usuarios_admin_perfis(
        perfis_admin(nome)
      ),
      usuarios_admin_setores(setor_id),
      usuarios_admin_unidades(unidade_id)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    ativo: data.ativo,
    created_at: data.created_at,
    updated_at: data.updated_at,
    perfis: (data.usuarios_admin_perfis || []).map((p: any) => p.perfis_admin?.nome).filter(Boolean),
    setores_ids: (data.usuarios_admin_setores || []).map((s: any) => s.setor_id),
    unidades_ids: (data.usuarios_admin_unidades || []).map((u: any) => u.unidade_id)
  }
}

export async function criar_usuario_admin(payload: {
  nome: string
  email: string
  senha: string
  ativo: boolean
  perfis: string[]
  setores_ids: number[]
  unidades_ids: number[]
}) {
  const supabase = get_supabase_admin()
  await garantir_perfis(payload.perfis)

  const senha_hash = await gerar_senha_hash(payload.senha)
  const { data: usuario, error } = await supabase
    .from('usuarios_admin')
    .insert({
      nome: payload.nome,
      email: payload.email,
      senha_hash,
      ativo: payload.ativo
    })
    .select('id')
    .single()

  if (error) throw error

  await substituir_relacoes(usuario.id, payload.perfis, payload.setores_ids, payload.unidades_ids)
  return obter_usuario_admin(usuario.id)
}

export async function atualizar_usuario_admin(id: string, payload: {
  nome?: string
  email?: string
  senha?: string
  ativo?: boolean
  perfis?: string[]
  setores_ids?: number[]
  unidades_ids?: number[]
}) {
  const supabase = get_supabase_admin()
  const update_data: Record<string, unknown> = {}
  if (payload.nome !== undefined) update_data.nome = payload.nome
  if (payload.email !== undefined) update_data.email = payload.email
  if (payload.ativo !== undefined) update_data.ativo = payload.ativo
  if (payload.senha) update_data.senha_hash = await gerar_senha_hash(payload.senha)

  if (Object.keys(update_data).length > 0) {
    const { error } = await supabase.from('usuarios_admin').update(update_data).eq('id', id)
    if (error) throw error
  }

  if (payload.perfis || payload.setores_ids || payload.unidades_ids) {
    await substituir_relacoes(id, payload.perfis || null, payload.setores_ids || null, payload.unidades_ids || null)
  }

  return obter_usuario_admin(id)
}

async function substituir_relacoes(id: string, perfis: string[] | null, setores_ids: number[] | null, unidades_ids: number[] | null) {
  const supabase = get_supabase_admin()

  if (perfis) {
    await garantir_perfis(perfis)
    const { error: del1 } = await supabase.from('usuarios_admin_perfis').delete().eq('usuario_admin_id', id)
    if (del1) throw del1
    if (perfis.length) {
      const { data: perfis_data, error: perfis_error } = await supabase.from('perfis_admin').select('id,nome').in('nome', perfis)
      if (perfis_error) throw perfis_error
      const rows = (perfis_data || []).map((item) => ({ usuario_admin_id: id, perfil_admin_id: item.id }))
      if (rows.length) {
        const { error: ins1 } = await supabase.from('usuarios_admin_perfis').insert(rows)
        if (ins1) throw ins1
      }
    }
  }

  if (setores_ids) {
    const { error: del2 } = await supabase.from('usuarios_admin_setores').delete().eq('usuario_admin_id', id)
    if (del2) throw del2
    const rows = setores_ids.map((setor_id) => ({ usuario_admin_id: id, setor_id }))
    if (rows.length) {
      const { error: ins2 } = await supabase.from('usuarios_admin_setores').insert(rows)
      if (ins2) throw ins2
    }
  }

  if (unidades_ids) {
    const { error: del3 } = await supabase.from('usuarios_admin_unidades').delete().eq('usuario_admin_id', id)
    if (del3) throw del3
    const rows = unidades_ids.map((unidade_id) => ({ usuario_admin_id: id, unidade_id }))
    if (rows.length) {
      const { error: ins3 } = await supabase.from('usuarios_admin_unidades').insert(rows)
      if (ins3) throw ins3
    }
  }
}
