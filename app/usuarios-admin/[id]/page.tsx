'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin_layout'
import { obter_usuario_admin, atualizar_usuario_admin } from '@/services/usuarios_admin.service'

export default function UsuarioAdminPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [perfis, setPerfis] = useState('')
  const [setores_ids, setSetoresIds] = useState('')
  const [unidades_ids, setUnidadesIds] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)

  function parse_ids(value: string) {
    return value.split(',').map((item) => Number(item.trim())).filter((item) => !Number.isNaN(item) && item > 0)
  }

  useEffect(() => {
    async function carregar() {
      try {
        const usuario = await obter_usuario_admin(id)
        setNome(usuario.nome || '')
        setEmail(usuario.email || '')
        setAtivo(Boolean(usuario.ativo))
        setPerfis((usuario.perfis || []).join(', '))
        setSetoresIds((usuario.setores_ids || []).join(', '))
        setUnidadesIds((usuario.unidades_ids || []).join(', '))
      } catch (e: any) {
        setErro(e?.message || 'Erro ao carregar usuário admin')
      } finally {
        setCarregando(false)
      }
    }

    if (id) carregar()
  }, [id])

  async function handle_submit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setMensagem('')
    try {
      await atualizar_usuario_admin(id, {
        nome,
        email,
        senha: senha || undefined,
        ativo,
        perfis: perfis.split(',').map((item) => item.trim()).filter(Boolean),
        setores_ids: parse_ids(setores_ids),
        unidades_ids: parse_ids(unidades_ids)
      })
      setMensagem('Usuário admin atualizado com sucesso')
      setSenha('')
    } catch (e: any) {
      setErro(e?.message || 'Erro ao atualizar usuário admin')
    }
  }

  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Editar usuário admin</h1>

        {carregando ? <div className="card">Carregando...</div> : null}

        {!carregando ? (
          <form className="card stack" onSubmit={handle_submit}>
            <div className="grid_2">
              <div className="field"><label>nome</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
              <div className="field"><label>email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="field"><label>nova senha</label><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="deixe em branco para manter" /></div>
              <div className="field"><label>ativo</label><select value={ativo ? 'true' : 'false'} onChange={(e) => setAtivo(e.target.value === 'true')}><option value="true">true</option><option value="false">false</option></select></div>
              <div className="field"><label>perfis</label><input value={perfis} onChange={(e) => setPerfis(e.target.value)} placeholder="super_admin" /></div>
              <div className="field"><label>setores_ids</label><input value={setores_ids} onChange={(e) => setSetoresIds(e.target.value)} placeholder="1,2" /></div>
              <div className="field"><label>unidades_ids</label><input value={unidades_ids} onChange={(e) => setUnidadesIds(e.target.value)} placeholder="1,2" /></div>
            </div>
            {erro ? <p className="error_text">{erro}</p> : null}
            {mensagem ? <p className="success_text">{mensagem}</p> : null}
            <button className="button" type="submit">Salvar alterações</button>
          </form>
        ) : null}
      </div>
    </AdminLayout>
  )
}
