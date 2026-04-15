export type UsuarioAdmin = {
  id: string
  nome: string
  email: string
  ativo: boolean
  created_at: string
  updated_at: string
  perfis?: string[]
  setores_ids?: number[]
  unidades_ids?: number[]
}
