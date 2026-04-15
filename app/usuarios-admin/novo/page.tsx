"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin_layout'
import { criar_usuario_admin } from '@/services/usuarios_admin.service'

export default function NovoUsuarioAdminPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [perfis, setPerfis] = useState('super_admin')
  const [setores_ids, setSetoresIds] = useState('')
  const [unidades_ids, setUnidadesIds] = useState('')
  const [erro, setErro] = useState('')

  function parse_ids(value: string) {
    return value.split(',').map((item) => Number(item.trim())).filter((item) => !Number.isNaN(item) && item > 0)
  }

  async function handle_submit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      const response = await criar_usuario_admin({
        nome,
        email,
        senha,
        ativo,
        perfis: perfis.split(',').map((item) => item.trim()).filter(Boolean),
        setores_ids: parse_ids(setores_ids),
        unidades_ids: parse_ids(unidades_ids)
      })
      router.push(`/usuarios-admin/${response.usuario_admin.id}`)
    } catch (e: any) {
      setErro(e?.mensagem || 'Erro ao criar usuário admin')
    }
  }

  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Novo usuário admin</h1>
        <form className="card stack" onSubmit={handle_submit}>
          <div className="grid_2">
            <div className="field"><label>nome</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            <div className="field"><label>email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="field"><label>senha</label><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
            <div className="field"><label>ativo</label><select value={ativo ? 'true' : 'false'} onChange={(e) => setAtivo(e.target.value === 'true')}><option value="true">true</option><option value="false">false</option></select></div>
            <div className="field"><label>perfis</label><input value={perfis} onChange={(e) => setPerfis(e.target.value)} placeholder="super_admin" /></div>
            <div className="field"><label>setores_ids</label><input value={setores_ids} onChange={(e) => setSetoresIds(e.target.value)} placeholder="1,2" /></div>
            <div className="field"><label>unidades_ids</label><input value={unidades_ids} onChange={(e) => setUnidadesIds(e.target.value)} placeholder="1,2" /></div>
          </div>
          {erro ? <p className="error_text">{erro}</p> : null}
          <button type="submit">Criar usuário admin</button>
        </form>
      </div>
    </AdminLayout>
  )
}
