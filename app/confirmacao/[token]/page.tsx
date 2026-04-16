'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  obter_confirmacao_por_token,
  confirmar_por_token
} from '@/services/confirmacao.service'

export default function ConfirmacaoPage() {
  const params = useParams<{ token: string }>()
  const token = params.token

  const [data, setData] = useState<any>(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const response = await obter_confirmacao_por_token(token)
        setData(response)
      } catch (e: any) {
        setErro(e?.mensagem || 'Erro ao carregar confirmação')
      }
    }

    if (token) {
      carregar()
    }
  }, [token])

  async function handle_confirmar() {
    try {
      await confirmar_por_token(token)
      setSucesso(true)
    } catch (e: any) {
      setErro(e?.mensagem || 'Erro ao confirmar')
    }
  }

  if (erro) {
    return <p className="error_text">{erro}</p>
  }

  if (sucesso) {
    return <p className="success_text">Confirmação realizada com sucesso</p>
  }

  if (!data) {
    return <p>Carregando...</p>
  }

  return (
    <main>
      <div className="container stack">
        <h1>{data.comunicado.titulo}</h1>

        <p>{data.comunicado.conteudo}</p>

        <button className="button" onClick={handle_confirmar}>
          Confirmo que li e estou ciente
        </button>
      </div>
    </main>
  )
}
