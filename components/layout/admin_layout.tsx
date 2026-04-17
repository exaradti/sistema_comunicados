"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { logout_admin } from '@/services/auth.service'

type MeResponse = {
  usuario_admin?: {
    nome: string
    email: string
    is_super_admin: boolean
    perfis: string[]
  }
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeResponse['usuario_admin'] | null>(null)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then(async (res) => res.ok ? res.json() : null)
      .then((data) => setMe(data?.usuario_admin || null))
      .catch(() => setMe(null))
  }, [])

  async function handle_logout() {
    await logout_admin()
    window.location.href = '/login'
  }

  return (
    <div className="sidebar_layout">
      <aside className="sidebar">
        <strong>Sistema</strong>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/funcionarios">Funcionários</Link>
        <Link href="/setores">Setores</Link>
        <Link href="/unidades">Unidades</Link>
        <Link href="/comunicados">Comunicados</Link>
        <Link href="/comunicados/novo">Novo comunicado</Link>
        {me?.is_super_admin ? <Link href="/usuarios-admin">Usuários admin</Link> : null}
      </aside>
      <div>
        <header className="header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>Área administrativa</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{me ? `${me.nome} (${me.email})` : ''}</span>
            <button type="button" className="button_secondary" onClick={handle_logout}>Sair</button>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
