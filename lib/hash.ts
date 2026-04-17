import crypto from 'crypto'

export function gerar_hash_conteudo(conteudo: string) {
  return crypto.createHash('sha256').update(conteudo).digest('hex')
}
