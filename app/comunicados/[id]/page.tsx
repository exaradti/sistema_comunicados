"use client"

import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '@/components/layout/admin_layout'
import AssinaturaPad from '@/components/comunicados/assinatura_pad'
import { enviar_comunicado, obter_comunicado, registrar_assinatura } from '@/services/comunicados.service'

export default function ComunicadoDetalhePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [status_filtro, setStatusFiltro] = useState('')
  const [nome_assinante, setNomeAssinante] = useState('')
  const [assinatura_base64, setAssinaturaBase64] = useState('')

  async function carregar() {
    try { setData(await obter_comunicado(params.id)) } catch (e: any) { setErro(e?.mensagem || 'Erro ao carregar comunicado') }
  }

  useEffect(() => { carregar() }, [params.id])

  const destinatarios_filtrados = useMemo(() => {
    if (!data?.destinatarios) return []
    if (!status_filtro) return data.destinatarios
    return data.destinatarios.filter((item: any) => item.status === status_filtro)
  }, [data, status_filtro])

  async function handle_enviar() {
    try { await enviar_comunicado(params.id); setMensagem('Envio executado com sucesso'); await carregar() } catch (e: any) { setErro(e?.mensagem || 'Erro ao enviar comunicado') }
  }

  async function handle_assinatura() {
    try {
      const destinatario = data?.destinatarios?.[0]
      await registrar_assinatura(params.id, { comunicado_destinatario_id: destinatario.id, nome_assinante, assinatura_base64 })
      setMensagem('Assinatura registrada com sucesso')
      await carregar()
    } catch (e: any) {
      setErro(e?.mensagem || 'Erro ao registrar assinatura')
    }
  }

  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Detalhes do comunicado</h1>
        {erro ? <p className="error_text">{erro}</p> : null}
        {mensagem ? <p className="success_text">{mensagem}</p> : null}
        {data ? (
          <>
            <div className="card stack">
              <div><strong>titulo:</strong> {data.comunicado.titulo}</div>
              <div><strong>categoria:</strong> {data.comunicado.categoria}</div>
              <div><strong>conteudo:</strong> {data.comunicado.conteudo}</div>
              <div><strong>tipo_confirmacao:</strong> {data.comunicado.tipo_confirmacao}</div>
              <div><strong>status:</strong> {data.comunicado.status}</div>
              <div className="row"><button onClick={handle_enviar}>Enviar comunicado</button></div>
            </div>
            <div className="card stack">
              <div className="row">
                <h2>destinatarios</h2>
                <select value={status_filtro} onChange={(e) => setStatusFiltro(e.target.value)}>
                  <option value="">todos</option>
                  <option value="pendente">pendente</option>
                  <option value="enviado">enviado</option>
                  <option value="visualizado">visualizado</option>
                  <option value="confirmado">confirmado</option>
                  <option value="expirado">expirado</option>
                  <option value="erro_envio">erro_envio</option>
                </select>
              </div>
              <div className="table_like">
                {destinatarios_filtrados.map((destinatario: any) => (
                  <div className="table_item" key={destinatario.id}>
                    <div><strong>funcionario_id:</strong> {destinatario.funcionario_id}</div>
                    <div><strong>nome:</strong> {destinatario.funcionarios?.nome || '-'}</div>
                    <div><strong>email:</strong> {destinatario.funcionarios?.email || '-'}</div>
                    <div><strong>status:</strong> {destinatario.status}</div>
                    <div><strong>metodo_confirmacao:</strong> {destinatario.metodo_confirmacao}</div>
                    <div><strong>data_envio_email:</strong> {destinatario.data_envio_email || '-'}</div>
                    <div><strong>data_visualizacao:</strong> {destinatario.data_visualizacao || '-'}</div>
                    <div><strong>data_confirmacao:</strong> {destinatario.data_confirmacao || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card stack">
              <h2>anexos</h2>
              <div className="table_like">
                {(data.anexos || []).map((anexo: any) => (
                  <div className="table_item" key={anexo.id}>
                    <div><strong>nome_arquivo:</strong> {anexo.nome_arquivo}</div>
                    <div><strong>caminho_arquivo:</strong> {anexo.caminho_arquivo}</div>
                    <div><strong>tipo_arquivo:</strong> {anexo.tipo_arquivo}</div>
                  </div>
                ))}
                {(data.anexos || []).length === 0 ? <div className="table_item">Nenhum anexo.</div> : null}
              </div>
            </div>
            {data.comunicado.tipo_confirmacao === 'assinatura' ? (
              <div className="card stack">
                <h2>Tela de assinatura</h2>
                <div className="field"><label>nome_assinante</label><input value={nome_assinante} onChange={(e) => setNomeAssinante(e.target.value)} /></div>
                <AssinaturaPad on_change={setAssinaturaBase64} />
                <div className="row"><button onClick={handle_assinatura}>Finalizar assinatura</button></div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </AdminLayout>
  )
}
