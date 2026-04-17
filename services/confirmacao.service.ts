import { api_fetch } from '@/services/api'
import type { ConfirmacaoTokenResponse } from '@/types/comunicado'

export async function obter_confirmacao_por_token(token: string): Promise<ConfirmacaoTokenResponse> {
  return api_fetch(`/api/confirmacao/${token}`)
}

export async function confirmar_por_token(token: string) {
  return api_fetch(`/api/confirmacao/${token}`, {
    method: 'POST'
  })
}
