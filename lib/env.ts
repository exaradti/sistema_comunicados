export function get_env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`)
  }
  return value
}
