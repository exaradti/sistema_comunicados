import { api_fetch } from '@/services/api'
import { Funcionario } from '@/types/funcionario'

export async function listar_funcionarios(): Promise<Funcionario[]> {
  const response = await api_fetch('/api/funcionarios')
  return response.funcionarios
}

export async function criar_funcionario(payload: { nome: string; email: string; setor_id: number; unidade_id: number; ativo: boolean }) {
  return api_fetch('/api/funcionarios', { method: 'POST', body: JSON.stringify(payload) })
}

export async function atualizar_funcionario(id: number, payload: Partial<Funcionario>) {
  return api_fetch(`/api/funcionarios/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}
