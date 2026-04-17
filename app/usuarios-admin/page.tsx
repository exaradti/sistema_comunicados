"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/admin_layout'
import { listar_usuarios_admin, atualizar_usuario_admin } from '@/services/usuarios_admin.service'

export default function UsuariosAdminPage() {
  const [usuarios_admin, setUsuariosAdmin] = useState<any[]>([])
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setUsuariosAdmin(await listar_usuarios_admin())
    } catch (e: any) {
      setErro(e?.mensagem || 'Erro ao carregar usuários admin')
    }
  }

  useEffect(() => { carregar() }, [])

  return (
    <AdminLayout>
      <div className="stack">
        <div className="page_header">
          <h1 className="page_title">Usuários admin</h1>
          <Link className="button" href="/usuarios-admin/novo">Novo admin</Link>
        </div>
        {erro ? <p className="error_text">{erro}</p> : null}
        <div className="card table_like">
          {usuarios_admin.map((usuario) => (
            <div className="table_item" key={usuario.id}>
              <div><strong>nome:</strong> {usuario.nome}</div>
              <div><strong>email:</strong> {usuario.email}</div>
              <div><strong>ativo:</strong> {usuario.ativo ? 'true' : 'false'}</div>
              <div><strong>perfis:</strong> {(usuario.perfis || []).join(', ') || '-'}</div>
              <div><strong>setores_ids:</strong> {(usuario.setores_ids || []).join(', ') || '-'}</div>
              <div><strong>unidades_ids:</strong> {(usuario.unidades_ids || []).join(', ') || '-'}</div>
              <div className="row">
                <Link href={`/usuarios-admin/${usuario.id}`}>Editar</Link>
                <button className="button_secondary" onClick={async () => { await atualizar_usuario_admin(usuario.id, { ativo: !usuario.ativo }); await carregar() }}>
                  {usuario.ativo ? 'Inativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
