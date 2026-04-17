'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { obter_comunicado, enviar_comunicado } from '@/services/comunicados.service'
import { ObterComunicadoResponse } from '@/types/comunicado'

export default function ComunicadoDetalhePage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [data, setData] = useState<ObterComunicadoResponse | null>(null)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const response = await obter_comunicado(id)
        setData(response)
      } catch (e: any) {
        setErro(e?.message || 'Erro ao carregar comunicado')
      }
    }

    if (id) {
      carregar()
    }
  }, [id])

  async function handle_enviar() {
    try {
      await enviar_comunicado(id)
      setMensagem('Comunicado enviado com sucesso')
    } catch (e: any) {
      setErro(e?.message || 'Erro ao enviar comunicado')
    }
  }

  if (erro) {
    return (
      <main>
        <div className="container stack">
          <p className="error_text">{erro}</p>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main>
        <div className="container stack">
          <p>Carregando...</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="container stack">
        <h1 className="page_title">Detalhes do comunicado</h1>

        {mensagem ? <p className="success_text">{mensagem}</p> : null}

        <div className="card stack">
          <div><strong>titulo:</strong> {data.comunicado.titulo}</div>
          <div><strong>categoria:</strong> {data.comunicado.categoria}</div>
          <div><strong>conteudo:</strong> {data.comunicado.conteudo}</div>
          <div><strong>tipo_confirmacao:</strong> {data.comunicado.tipo_confirmacao}</div>
          <div><strong>status:</strong> {data.comunicado.status}</div>

          <div className="row">
            <button className="button" onClick={handle_enviar}>
              Enviar comunicado
            </button>
          </div>
        </div>

        <div className="card stack">
          <h2>destinatarios</h2>

          <div className="table_like">
            {data.destinatarios.map((destinatario) => (
              <div className="table_item" key={destinatario.id}>
                <div><strong>funcionario_id:</strong> {destinatario.funcionario_id}</div>
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
            {(data.anexos || []).map((anexo) => (
              <div className="table_item" key={anexo.id}>
                <div><strong>nome_arquivo:</strong> {anexo.nome_arquivo}</div>
                <div><strong>tipo_arquivo:</strong> {anexo.tipo_arquivo}</div>
                <div><strong>tamanho_bytes:</strong> {anexo.tamanho_bytes}</div>
              </div>
            ))}

            {(data.anexos || []).length === 0 ? (
              <div className="table_item">Nenhum anexo.</div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
