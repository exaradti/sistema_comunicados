import { api_fetch } from '@/services/api'
import { ObterComunicadoResponse } from '@/types/comunicado'

export async function obter_comunicado(id: string): Promise<ObterComunicadoResponse> {
  return api_fetch(`/api/comunicados/${id}`)
}

export async function enviar_comunicado(id: string) {
  return api_fetch(`/api/comunicados/${id}/enviar`, {
    method: 'POST'
  })
}
