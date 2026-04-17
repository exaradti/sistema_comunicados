"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { login_admin, obter_sessao_admin } from '@/services/auth.service'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    obter_sessao_admin()
      .then(() => {
        router.replace('/dashboard')
        router.refresh()
      })
      .catch(() => {})
  }, [router])

  async function handle_submit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      await login_admin({ email, password })
      router.push('/dashboard')
      router.refresh()
    } catch (e: any) {
      setErro(e?.mensagem || 'Erro ao autenticar')
    }
  }

  return (
    <main>
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card stack">
          <h1 className="page_title">Login administrativo</h1>
          <form className="stack" onSubmit={handle_submit}>
            <div className="field"><label>email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="field"><label>password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {erro ? <p className="error_text">{erro}</p> : null}
            <button type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </main>
  )
}
