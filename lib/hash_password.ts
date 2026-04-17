import bcrypt from 'bcryptjs'

export async function gerar_senha_hash(senha: string) {
  return bcrypt.hash(senha, 10)
}

export async function validar_senha_hash(senha: string, senha_hash: string) {
  return bcrypt.compare(senha, senha_hash)
}
