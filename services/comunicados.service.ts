import { api_fetch } from '@/services/api'

export async function listar_comunicados() {
  return api_fetch('/api/comunicados')
}

export async function obter_comunicado(id: number | string) {
  return api_fetch(`/api/comunicados/${id}`)
}

export async function criar_comunicado(payload: {
  titulo: string
  categoria: string
  conteudo: string
  setor_origem_id: number
  responsavel_nome: string
  responsavel_email: string
  tipo_confirmacao: 'assinatura' | 'email'
  funcionario_id?: number
  funcionarios_ids?: number[]
  setores_ids?: number[]
}) {
  return api_fetch('/api/comunicados', { method: 'POST', body: JSON.stringify(payload) })
}

export async function enviar_comunicado(id: number | string) {
  return api_fetch(`/api/comunicados/${id}/enviar`, { method: 'POST' })
}

export async function registrar_assinatura(id: number | string, payload: { comunicado_destinatario_id: number; nome_assinante: string; assinatura_base64: string }) {
  return api_fetch(`/api/comunicados/${id}/assinatura`, { method: 'POST', body: JSON.stringify(payload) })
}
