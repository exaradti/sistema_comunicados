"use client"

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/admin_layout'
import { criar_setor, listar_setores, atualizar_setor } from '@/services/setores.service'
import { Setor } from '@/types/setor'

export default function SetoresPage() {
  const [setores, setSetores] = useState<Setor[]>([])
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')

  async function carregar() {
    try { setSetores(await listar_setores()) } catch (e: any) { setErro(e?.mensagem || 'Erro ao carregar setores') }
  }

  useEffect(() => { carregar() }, [])

  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Setores</h1>
        <div className="card stack">
          <form className="row" onSubmit={async (e) => { e.preventDefault(); await criar_setor({ nome, ativo: true }); setNome(''); await carregar() }}>
            <div className="field"><label>nome</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            <button type="submit">Criar setor</button>
          </form>
          {erro ? <p className="error_text">{erro}</p> : null}
        </div>
        <div className="card table_like">
          {setores.map((setor) => (
            <div className="table_item" key={setor.id}>
              <div><strong>nome:</strong> {setor.nome}</div>
              <div><strong>ativo:</strong> {setor.ativo ? 'true' : 'false'}</div>
              <div className="row">
                <button className="button_secondary" onClick={async () => { const novo_nome = prompt('Novo nome', setor.nome); if (novo_nome) { await atualizar_setor(setor.id, { nome: novo_nome }); await carregar() } }}>Editar nome</button>
                <button className="button_secondary" onClick={async () => { await atualizar_setor(setor.id, { ativo: !setor.ativo }); await carregar() }}>{setor.ativo ? 'Inativar' : 'Ativar'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
