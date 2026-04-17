"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layout/admin_layout'
import { listar_comunicados } from '@/services/comunicados.service'

export default function ComunicadosPage() {
  const [comunicados, setComunicados] = useState<any[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const response = await listar_comunicados()
        setComunicados(response.comunicados || [])
      } catch (e: any) {
        setErro(e?.mensagem || 'Erro ao carregar comunicados')
      }
    }
    carregar()
  }, [])

  return (
    <AdminLayout>
      <div className="stack">
        <div className="page_header">
          <h1 className="page_title">Comunicados</h1>
          <Link className="button" href="/comunicados/novo">Novo comunicado</Link>
        </div>
        <div className="card table_like">
          {erro ? <p className="error_text">{erro}</p> : null}
          {comunicados.map((comunicado) => (
            <div className="table_item" key={comunicado.id}>
              <div><strong>titulo:</strong> {comunicado.titulo}</div>
              <div><strong>categoria:</strong> {comunicado.categoria}</div>
              <div><strong>tipo_confirmacao:</strong> {comunicado.tipo_confirmacao}</div>
              <div><strong>status:</strong> {comunicado.status}</div>
              <div><strong>total_destinatarios:</strong> {comunicado.total_destinatarios}</div>
              <div><strong>total_confirmados:</strong> {comunicado.total_confirmados}</div>
              <Link href={`/comunicados/${comunicado.id}`}>Ver detalhes</Link>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
