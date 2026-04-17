"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin_layout'
import { criar_comunicado } from '@/services/comunicados.service'

export default function NovoComunicadoPage() {
  const router = useRouter()
  const [tipo_confirmacao, setTipoConfirmacao] = useState<'assinatura' | 'email'>('email')
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [setor_origem_id, setSetorOrigemId] = useState('')
  const [responsavel_nome, setResponsavelNome] = useState('')
  const [responsavel_email, setResponsavelEmail] = useState('')
  const [funcionario_id, setFuncionarioId] = useState('')
  const [funcionarios_ids, setFuncionariosIds] = useState('')
  const [setores_ids, setSetoresIds] = useState('')
  const [destinatarios_preview, setDestinatariosPreview] = useState<any>(null)
  const [erro, setErro] = useState('')

  function parse_ids(value: string) {
    return value.split(',').map((item) => item.trim()).filter(Boolean).map((item) => Number(item)).filter((item) => !Number.isNaN(item))
  }

  async function handle_submit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      const payload = tipo_confirmacao === 'assinatura'
        ? { titulo, categoria, conteudo, setor_origem_id: Number(setor_origem_id), responsavel_nome, responsavel_email, tipo_confirmacao, funcionario_id: Number(funcionario_id) }
        : { titulo, categoria, conteudo, setor_origem_id: Number(setor_origem_id), responsavel_nome, responsavel_email, tipo_confirmacao, funcionarios_ids: parse_ids(funcionarios_ids), setores_ids: parse_ids(setores_ids) }

      const response = await criar_comunicado(payload as any)
      setDestinatariosPreview(response)
      router.push(`/comunicados/${response.comunicado.id}`)
    } catch (e: any) {
      setErro(e?.mensagem || 'Erro ao criar comunicado')
    }
  }

  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Novo comunicado</h1>
        <form className="card stack" onSubmit={handle_submit}>
          <div className="field">
            <label>tipo_confirmacao</label>
            <select value={tipo_confirmacao} onChange={(e) => setTipoConfirmacao(e.target.value as 'assinatura' | 'email')}>
              <option value="email">email</option>
              <option value="assinatura">assinatura</option>
            </select>
          </div>
          <div className="grid_2">
            <div className="field"><label>titulo</label><input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
            <div className="field"><label>categoria</label><input value={categoria} onChange={(e) => setCategoria(e.target.value)} /></div>
            <div className="field"><label>setor_origem_id</label><input value={setor_origem_id} onChange={(e) => setSetorOrigemId(e.target.value)} /></div>
            <div className="field"><label>responsavel_nome</label><input value={responsavel_nome} onChange={(e) => setResponsavelNome(e.target.value)} /></div>
            <div className="field"><label>responsavel_email</label><input value={responsavel_email} onChange={(e) => setResponsavelEmail(e.target.value)} /></div>
          </div>
          <div className="field"><label>conteudo</label><textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} /></div>
          {tipo_confirmacao === 'assinatura' ? <div className="field"><label>funcionario_id</label><input value={funcionario_id} onChange={(e) => setFuncionarioId(e.target.value)} /></div> : null}
          {tipo_confirmacao === 'email' ? (
            <div className="grid_2">
              <div className="field"><label>funcionarios_ids</label><input value={funcionarios_ids} onChange={(e) => setFuncionariosIds(e.target.value)} placeholder="10,11,12" /></div>
              <div className="field"><label>setores_ids</label><input value={setores_ids} onChange={(e) => setSetoresIds(e.target.value)} placeholder="2,3" /></div>
            </div>
          ) : null}
          {erro ? <p className="error_text">{erro}</p> : null}
          <button type="submit">Criar comunicado</button>
        </form>
        {destinatarios_preview ? (
          <div className="card stack">
            <h2>Resumo consolidado</h2>
            <div><strong>duplicados_removidos:</strong> {(destinatarios_preview.duplicados_removidos || []).join(', ') || '-'}</div>
            <div className="table_like">
              {(destinatarios_preview.destinatarios_sem_email || []).map((item: any) => (
                <div className="table_item" key={item.funcionario_id}>sem email: {item.nome} ({item.funcionario_id})</div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  )
}
