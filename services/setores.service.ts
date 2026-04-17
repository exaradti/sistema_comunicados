import { api_fetch } from '@/services/api'
import { Setor } from '@/types/setor'

export async function listar_setores(): Promise<Setor[]> {
  const response = await api_fetch('/api/setores')
  return response.setores
}

export async function criar_setor(payload: { nome: string; ativo: boolean }) {
  return api_fetch('/api/setores', { method: 'POST', body: JSON.stringify(payload) })
}

export async function atualizar_setor(id: number, payload: Partial<Setor>) {
  return api_fetch(`/api/setores/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}
