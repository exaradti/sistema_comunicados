"use client"

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/admin_layout'
import { criar_unidade, listar_unidades, atualizar_unidade } from '@/services/unidades.service'
import { Unidade } from '@/types/unidade'

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')

  async function carregar() {
    try { setUnidades(await listar_unidades()) } catch (e: any) { setErro(e?.mensagem || 'Erro ao carregar unidades') }
  }

  useEffect(() => { carregar() }, [])

  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Unidades</h1>
        <div className="card stack">
          <form className="row" onSubmit={async (e) => { e.preventDefault(); await criar_unidade({ nome, ativo: true }); setNome(''); await carregar() }}>
            <div className="field"><label>nome</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            <button type="submit">Criar unidade</button>
          </form>
          {erro ? <p className="error_text">{erro}</p> : null}
        </div>
        <div className="card table_like">
          {unidades.map((unidade) => (
            <div className="table_item" key={unidade.id}>
              <div><strong>nome:</strong> {unidade.nome}</div>
              <div><strong>ativo:</strong> {unidade.ativo ? 'true' : 'false'}</div>
              <div className="row">
                <button className="button_secondary" onClick={async () => { const novo_nome = prompt('Novo nome', unidade.nome); if (novo_nome) { await atualizar_unidade(unidade.id, { nome: novo_nome }); await carregar() } }}>Editar nome</button>
                <button className="button_secondary" onClick={async () => { await atualizar_unidade(unidade.id, { ativo: !unidade.ativo }); await carregar() }}>{unidade.ativo ? 'Inativar' : 'Ativar'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
