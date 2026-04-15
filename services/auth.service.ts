import { api_fetch } from '@/services/api'

export async function login_admin(payload: { email: string; password: string }) {
  return api_fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export async function logout_admin() {
  return api_fetch('/api/auth/logout', { method: 'POST' })
}

export async function obter_sessao_admin() {
  return api_fetch('/api/auth/me')
}
