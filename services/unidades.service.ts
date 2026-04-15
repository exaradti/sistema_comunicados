import { api_fetch } from '@/services/api'
import { Unidade } from '@/types/unidade'

export async function listar_unidades(): Promise<Unidade[]> {
  const response = await api_fetch('/api/unidades')
  return response.unidades
}

export async function criar_unidade(payload: { nome: string; ativo: boolean }) {
  return api_fetch('/api/unidades', { method: 'POST', body: JSON.stringify(payload) })
}

export async function atualizar_unidade(id: number, payload: Partial<Unidade>) {
  return api_fetch(`/api/unidades/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}
