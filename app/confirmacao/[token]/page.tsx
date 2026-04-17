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
        setErro(e.message)
      }
    }

    if (token) carregar()
  }, [token])

  async function handle_confirmar() {
    try {
      await confirmar_por_token(token)
      setSucesso(true)
    } catch (e: any) {
      setErro(e.message)
    }
  }

  if (erro) return <p>{erro}</p>
  if (sucesso) return <p>Confirmado com sucesso</p>
  if (!data) return <p>Carregando...</p>

  return (
    <main>
      <h1>{data.comunicado.titulo}</h1>
      <p>{data.comunicado.conteudo}</p>

      <button onClick={handle_confirmar}>
        Confirmar leitura
      </button>
    </main>
  )
}
