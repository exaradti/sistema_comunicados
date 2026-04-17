import { api_fetch } from '@/services/api'
import type { ObterComunicadoResponse } from '@/types/comunicado'

export async function listar_comunicados() {
  return api_fetch('/api/comunicados')
}

export async function obter_comunicado(id: string | number): Promise<ObterComunicadoResponse> {
  return api_fetch(`/api/comunicados/${id}`)
}

export async function criar_comunicado(payload: Record<string, any>) {
  return api_fetch('/api/comunicados', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function enviar_comunicado(id: string | number) {
  return api_fetch(`/api/comunicados/${id}/enviar`, {
    method: 'POST'
  })
}

export async function registrar_assinatura(id: string | number, payload: Record<string, any>) {
  return api_fetch(`/api/comunicados/${id}/assinatura`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
