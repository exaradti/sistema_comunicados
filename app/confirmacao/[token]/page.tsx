"use client"

import { useEffect, useState } from 'react'
import { confirmar_por_token, obter_confirmacao_por_token } from '@/services/confirmacao.service'

export default function ConfirmacaoPage({ params }: { params: { token: string } }) {
  const [estado, setEstado] = useState<'carregando' | 'invalido' | 'expirado' | 'utilizado' | 'valido' | 'confirmado'>('carregando')
  const [data, setData] = useState<any>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const response = await obter_confirmacao_por_token(params.token)
        setData(response)
        if (response.token_status === 'invalido') setEstado('invalido')
        else if (response.token_status === 'expirado') setEstado('expirado')
        else if (response.token_status === 'utilizado') setEstado('utilizado')
        else setEstado('valido')
      } catch (e: any) {
        setErro(e?.mensagem || 'Erro ao validar token')
        setEstado('invalido')
      }
    }
    carregar()
  }, [params.token])

  async function handle_confirmar() {
    try { await confirmar_por_token(params.token); setEstado('confirmado') } catch (e: any) { setErro(e?.mensagem || 'Erro ao confirmar ciência') }
  }

  return (
    <main>
      <div className="container stack">
        <div className="card stack">
          {estado === 'carregando' ? <h1 className="page_title">Carregando...</h1> : null}
          {estado === 'invalido' ? <h1 className="page_title">Token inválido</h1> : null}
          {estado === 'expirado' ? <h1 className="page_title">Token expirado</h1> : null}
          {estado === 'utilizado' ? <h1 className="page_title">Token já utilizado</h1> : null}
          {estado === 'confirmado' ? <h1 className="page_title">Confirmação registrada com sucesso</h1> : null}
          {estado === 'valido' ? (
            <>
              <h1 className="page_title">{data?.comunicado?.titulo}</h1>
              <div>{data?.comunicado?.conteudo}</div>
              <div className="table_like">
                {(data?.anexos || []).map((anexo: any) => (
                  <div className="table_item" key={anexo.id}>
                    <div><strong>nome_arquivo:</strong> {anexo.nome_arquivo}</div>
                    <div><strong>tipo_arquivo:</strong> {anexo.tipo_arquivo}</div>
                  </div>
                ))}
              </div>
              <button onClick={handle_confirmar}>Confirmo que li e estou ciente</button>
            </>
          ) : null}
          {erro ? <p className="error_text">{erro}</p> : null}
        </div>
      </div>
    </main>
  )
}
