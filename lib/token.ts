import crypto from 'crypto'

export function gerar_token_confirmacao() {
  return crypto.randomBytes(32).toString('hex')
}
