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
        setErro(e.message)
      }
    }

    if (id) carregar()
  }, [id])

  async function handle_enviar() {
    try {
      await enviar_comunicado(id)
      setMensagem('Comunicado enviado com sucesso')
    } catch (e: any) {
      setErro(e.message)
    }
  }

  if (!data) return <p>Carregando...</p>

  return (
    <main>
      <h1>{data.comunicado.titulo}</h1>
      <p>{data.comunicado.conteudo}</p>
      <button onClick={handle_enviar}>Enviar</button>
      {erro && <p>{erro}</p>}
      {mensagem && <p>{mensagem}</p>}
    </main>
  )
}
