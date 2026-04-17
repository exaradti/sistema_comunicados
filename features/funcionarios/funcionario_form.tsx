"use client"

import { useState } from 'react'

export default function FuncionarioForm({ initial_values, on_submit }: { initial_values?: { nome: string; email: string; setor_id: number; unidade_id: number; ativo: boolean }; on_submit: (payload: { nome: string; email: string; setor_id: number; unidade_id: number; ativo: boolean }) => Promise<void> }) {
  const [nome, setNome] = useState(initial_values?.nome || '')
  const [email, setEmail] = useState(initial_values?.email || '')
  const [setor_id, setSetorId] = useState(String(initial_values?.setor_id || ''))
  const [unidade_id, setUnidadeId] = useState(String(initial_values?.unidade_id || ''))
  const [ativo, setAtivo] = useState(initial_values?.ativo ?? true)

  return (
    <form className="grid_2" onSubmit={async (e) => {
      e.preventDefault()
      await on_submit({ nome, email, setor_id: Number(setor_id), unidade_id: Number(unidade_id), ativo })
    }}>
      <div className="field"><label>nome</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
      <div className="field"><label>email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label>setor_id</label><input value={setor_id} onChange={(e) => setSetorId(e.target.value)} /></div>
      <div className="field"><label>unidade_id</label><input value={unidade_id} onChange={(e) => setUnidadeId(e.target.value)} /></div>
      <div className="field"><label>ativo</label><select value={ativo ? 'true' : 'false'} onChange={(e) => setAtivo(e.target.value === 'true')}><option value="true">true</option><option value="false">false</option></select></div>
      <div className="row"><button type="submit">Salvar</button></div>
    </form>
  )
}
