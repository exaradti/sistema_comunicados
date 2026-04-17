'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import {
  obter_confirmacao_por_token,
  confirmar_por_token
} from '@/services/confirmacao.service'
import { registrar_assinatura } from '@/services/comunicados.service'
import type { ConfirmacaoTokenResponse } from '@/types/comunicado'

export default function ConfirmacaoPage() {
  const params = useParams<{ token: string }>()
  const token = params.token
  const assinatura_ref = useRef<SignatureCanvas | null>(null)

  const [data, setData] = useState<ConfirmacaoTokenResponse | null>(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [nome_assinante, setNomeAssinante] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const response = await obter_confirmacao_por_token(token)
        setData(response)
      } catch (e: any) {
        setErro(e?.message || 'Erro ao carregar confirmação')
      }
    }

    if (token) carregar()
  }, [token])

  async function handle_confirmar() {
    try {
      await confirmar_por_token(token)
      setSucesso(true)
    } catch (e: any) {
      setErro(e?.message || 'Erro ao confirmar')
    }
  }

  async function handle_assinar() {
    try {
      if (!data?.destinatario || !data.comunicado?.id) {
        throw new Error('Dados de assinatura indisponíveis')
      }
      if (!nome_assinante.trim()) {
        throw new Error('Informe o nome do assinante')
      }
      const canvas = assinatura_ref.current
      if (!canvas || canvas.isEmpty()) {
        throw new Error('Assine no campo indicado')
      }

      await registrar_assinatura(data.comunicado.id, {
        comunicado_destinatario_id: data.destinatario.id,
        token_confirmacao: token,
        nome_assinante,
        assinatura_base64: canvas.toDataURL('image/png')
      })
      setSucesso(true)
    } catch (e: any) {
      setErro(e?.message || 'Erro ao registrar assinatura')
    }
  }

  if (erro) {
    return <p className="error_text">{erro}</p>
  }

  if (!data) {
    return <p>Carregando...</p>
  }

  if (sucesso) {
    return <p className="success_text">Operação realizada com sucesso</p>
  }

  if (data.token_status === 'invalido') return <p className="error_text">Token inválido</p>
  if (data.token_status === 'expirado') return <p className="error_text">Token expirado</p>
  if (data.token_status === 'utilizado') return <p className="success_text">Token já utilizado</p>

  const exige_assinatura = data.destinatario?.metodo_confirmacao === 'assinatura'

  return (
    <main>
      <div className="container stack">
        <div className="card stack">
          <h1>{data.comunicado?.titulo}</h1>
          <p>{data.comunicado?.conteudo}</p>

          {(data.anexos || []).map((anexo) => (
            <div className="table_item" key={anexo.id}>
              <div><strong>nome_arquivo:</strong> {anexo.nome_arquivo}</div>
              <div><strong>tipo_arquivo:</strong> {anexo.tipo_arquivo}</div>
            </div>
          ))}

          {!exige_assinatura ? (
            <button className="button" onClick={handle_confirmar}>
              Confirmo que li e estou ciente
            </button>
          ) : (
            <div className="stack">
              <div className="field">
                <label>nome_assinante</label>
                <input value={nome_assinante} onChange={(e) => setNomeAssinante(e.target.value)} />
              </div>
              <div className="field">
                <label>assinatura</label>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}>
                  <SignatureCanvas
                    ref={(ref) => { assinatura_ref.current = ref }}
                    penColor="black"
                    canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
                  />
                </div>
                <div className="row">
                  <button type="button" className="button_secondary" onClick={() => assinatura_ref.current?.clear()}>
                    Limpar assinatura
                  </button>
                  <button type="button" className="button" onClick={handle_assinar}>
                    Assinar e concluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
