const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function api_fetch(path: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    cache: 'no-store',
    credentials: 'include'
  })

  const content_type = response.headers.get('content-type')
  if (!response.ok) {
    if (content_type?.includes('application/json')) throw await response.json()
    throw { erro: 'erro_http', mensagem: await response.text() }
  }

  if (content_type?.includes('application/json')) return response.json()
  return null
}
