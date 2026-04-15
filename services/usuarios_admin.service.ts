import { api_fetch } from '@/services/api'
import { UsuarioAdmin } from '@/types/usuario_admin'

export async function listar_usuarios_admin(): Promise<UsuarioAdmin[]> {
  const response = await api_fetch('/api/usuarios-admin')
  return response.usuarios_admin || []
}

export async function obter_usuario_admin(id: string) {
  const response = await api_fetch(`/api/usuarios-admin/${id}`)
  return response.usuario_admin
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
  return api_fetch('/api/usuarios-admin', { method: 'POST', body: JSON.stringify(payload) })
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
  return api_fetch(`/api/usuarios-admin/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}
