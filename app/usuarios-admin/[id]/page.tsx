'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function UsuarioAdminPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [senha, setSenha] = useState('')

  async function alterar_senha() {
    try {
      const response = await fetch(`/api/usuarios-admin/${id}/senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senha })
      })

      if (!response.ok) {
        throw new Error('Erro ao alterar senha')
      }

      setMensagem('Senha alterada com sucesso')
    } catch (e: any) {
      setErro(e?.message || 'Erro ao alterar senha')
    }
  }

  return (
    <main>
      <div className="container stack">
        <h1>Alterar senha do admin</h1>

        {erro ? <p className="error_text">{erro}</p> : null}
        {mensagem ? <p className="success_text">{mensagem}</p> : null}

        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button className="button" onClick={alterar_senha}>
          Alterar senha
        </button>
      </div>
    </main>
  )
}
