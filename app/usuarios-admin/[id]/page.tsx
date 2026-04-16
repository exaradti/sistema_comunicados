"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin_layout'
import { atualizar_usuario_admin, obter_usuario_admin } from '@/services/usuarios_admin.service'

export default function UsuarioAdminDetalhePage() {
  const params = useParams<{ id: string }>()
  const [usuario_admin, setUsuarioAdmin] = useState<any>(null)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [senha, setSenha] = useState('')

  async function carregar() {
    try {
      setUsuarioAdmin(await obter_usuario_admin(params.id))
    } catch (e: any) {
      setErro(e?.mensagem || 'Erro ao carregar usuário admin')
    }
  }

  useEffect(() => { carregar() }, [params.id])

  async function salvar() {
    try {
      setErro('')
      await atualizar_usuario_admin(params.id, {
        nome: usuario_admin.nome,
        email: usuario_admin.email,
        ativo: usuario_admin.ativo,
        senha: senha || undefined,
        perfis: (usuario_admin.perfis_texto || '').split(',').map((item: string) => item.trim()).filter(Boolean),
        setores_ids: (usuario_admin.setores_texto || '').split(',').map((item: string) => Number(item.trim())).filter((item: number) => !Number.isNaN(item) && item > 0),
        unidades_ids: (usuario_admin.unidades_texto || '').split(',').map((item: string) => Number(item.trim())).filter((item: number) => !Number.isNaN(item) && item > 0)
      })
      setMensagem('Usuário admin atualizado com sucesso')
      setSenha('')
      await carregar()
    } catch (e: any) {
      setErro(e?.mensagem || 'Erro ao salvar usuário admin')
    }
  }

  useEffect(() => {
    if (usuario_admin) {
      setUsuarioAdmin({
        ...usuario_admin,
        perfis_texto: (usuario_admin.perfis || []).join(', '),
        setores_texto: (usuario_admin.setores_ids || []).join(', '),
        unidades_texto: (usuario_admin.unidades_ids || []).join(', ')
      })
    }
  }, [usuario_admin?.id])

  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Editar usuário admin</h1>
        {erro ? <p className="error_text">{erro}</p> : null}
        {mensagem ? <p className="success_text">{mensagem}</p> : null}
        {usuario_admin ? (
          <div className="card stack">
            <div className="grid_2">
              <div className="field"><label>nome</label><input value={usuario_admin.nome || ''} onChange={(e) => setUsuarioAdmin({ ...usuario_admin, nome: e.target.value })} /></div>
              <div className="field"><label>email</label><input value={usuario_admin.email || ''} onChange={(e) => setUsuarioAdmin({ ...usuario_admin, email: e.target.value })} /></div>
              <div className="field"><label>ativo</label><select value={usuario_admin.ativo ? 'true' : 'false'} onChange={(e) => setUsuarioAdmin({ ...usuario_admin, ativo: e.target.value === 'true' })}><option value="true">true</option><option value="false">false</option></select></div>
              <div className="field"><label>nova_senha</label><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
              <div className="field"><label>perfis</label><input value={usuario_admin.perfis_texto || ''} onChange={(e) => setUsuarioAdmin({ ...usuario_admin, perfis_texto: e.target.value })} /></div>
              <div className="field"><label>setores_ids</label><input value={usuario_admin.setores_texto || ''} onChange={(e) => setUsuarioAdmin({ ...usuario_admin, setores_texto: e.target.value })} /></div>
              <div className="field"><label>unidades_ids</label><input value={usuario_admin.unidades_texto || ''} onChange={(e) => setUsuarioAdmin({ ...usuario_admin, unidades_texto: e.target.value })} /></div>
            </div>
            <button type="button" onClick={salvar}>Salvar</button>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  )
}
