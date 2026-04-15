"use client"

import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function AssinaturaPad({ on_change }: { on_change: (base64: string) => void }) {
  const ref = useRef<SignatureCanvas | null>(null)

  function salvar() {
    const assinatura_base64 = ref.current?.getTrimmedCanvas().toDataURL('image/png') || ''
    on_change(assinatura_base64)
  }

  function limpar() {
    ref.current?.clear()
    on_change('')
  }

  return (
    <div className="stack">
      <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}>
        <SignatureCanvas penColor="black" canvasProps={{ width: 600, height: 220, style: { width: '100%', height: 220 } }} ref={ref} />
      </div>
      <div className="row">
        <button type="button" className="button_secondary" onClick={limpar}>Limpar</button>
        <button type="button" className="button" onClick={salvar}>Salvar assinatura</button>
      </div>
    </div>
  )
}
