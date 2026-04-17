"use client"

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/admin_layout'
import FuncionarioForm from '@/features/funcionarios/funcionario_form'
import { criar_funcionario, listar_funcionarios, atualizar_funcionario } from '@/services/funcionarios.service'
import { Funcionario } from '@/types/funcionario'

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [editando_id, setEditandoId] = useState<number | null>(null)

  async function carregar() {
    try { setFuncionarios(await listar_funcionarios()) } catch (e: any) { setErro(e?.mensagem || 'Erro ao carregar funcionários') }
  }

  useEffect(() => { carregar() }, [])

  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Funcionários</h1>
        <div className="card stack">
          <h2>Criar funcionário</h2>
          <FuncionarioForm on_submit={async (payload) => { await criar_funcionario(payload); setMensagem('Funcionário criado com sucesso'); await carregar() }} />
          {mensagem ? <p className="success_text">{mensagem}</p> : null}
          {erro ? <p className="error_text">{erro}</p> : null}
        </div>
        <div className="card stack">
          <h2>Listagem</h2>
          <div className="table_like">
            {funcionarios.map((funcionario) => (
              <div className="table_item" key={funcionario.id}>
                <div><strong>nome:</strong> {funcionario.nome}</div>
                <div><strong>email:</strong> {funcionario.email}</div>
                <div><strong>setor_id:</strong> {funcionario.setor_id}</div>
                <div><strong>unidade_id:</strong> {funcionario.unidade_id}</div>
                <div><strong>ativo:</strong> {funcionario.ativo ? 'true' : 'false'}</div>
                <div className="row">
                  <button className="button_secondary" onClick={() => setEditandoId(editando_id === funcionario.id ? null : funcionario.id)}>Editar</button>
                  <button className="button_secondary" onClick={async () => { await atualizar_funcionario(funcionario.id, { ativo: !funcionario.ativo }); await carregar() }}>{funcionario.ativo ? 'Inativar' : 'Ativar'}</button>
                </div>
                {editando_id === funcionario.id ? <FuncionarioForm initial_values={funcionario} on_submit={async (payload) => { await atualizar_funcionario(funcionario.id, payload); setEditandoId(null); await carregar() }} /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
