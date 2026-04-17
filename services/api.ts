export async function api_fetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    let errorMessage = 'Erro na requisição'

    try {
      const data = await response.json()
      errorMessage = data?.mensagem || errorMessage
    } catch {}

    throw new Error(errorMessage)
  }

  return response.json()
}
