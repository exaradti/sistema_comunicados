import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { get_env } from '@/lib/env'
import { get_supabase_admin } from '@/lib/supabase'
import { validar_senha_hash } from '@/lib/hash_password'

const encoder = new TextEncoder()
export const ADMIN_SESSION_COOKIE = 'admin_session'

export type AdminSession = {
  sub: string
  email: string
  nome: string
  perfis: string[]
  is_super_admin: boolean
}

function get_secret() {
  return encoder.encode(get_env('JWT_SECRET'))
}

export async function criar_admin_session(payload: AdminSession) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(get_secret())
}

export async function validar_admin_session(token: string): Promise<AdminSession> {
  const { payload } = await jwtVerify(token, get_secret())
  return {
    sub: String(payload.sub || ''),
    email: String(payload.email || ''),
    nome: String(payload.nome || ''),
    perfis: Array.isArray(payload.perfis) ? payload.perfis.map(String) : [],
    is_super_admin: Boolean(payload.is_super_admin)
  }
}

export async function obter_admin_por_email(email: string) {
  const supabase = get_supabase_admin()
  const { data, error } = await supabase
    .from('usuarios_admin')
    .select(`
      id,
      nome,
      email,
      senha_hash,
      ativo,
      usuarios_admin_perfis(
        perfis_admin(nome)
      )
    `)
    .eq('email', email)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function autenticar_admin(email: string, senha: string): Promise<AdminSession | null> {
  const admin = await obter_admin_por_email(email)
  if (!admin || !admin.ativo) return null

  const senha_ok = await validar_senha_hash(senha, admin.senha_hash)
  if (!senha_ok) return null

  const perfis = ((admin.usuarios_admin_perfis || []) as any[])
    .map((item) => item?.perfis_admin?.nome)
    .filter(Boolean)

  return {
    sub: String(admin.id),
    email: admin.email,
    nome: admin.nome,
    perfis,
    is_super_admin: perfis.includes('super_admin')
  }
}

export async function get_current_admin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  try {
    return await validar_admin_session(token)
  } catch {
    return null
  }
}

export async function require_admin() {
  const session = await get_current_admin()
  if (!session?.sub) {
    throw new Error('não autenticado')
  }
  return session
}

export async function require_super_admin() {
  const session = await require_admin()
  if (!session.is_super_admin) {
    throw new Error('acesso_negado')
  }
  return session
}
