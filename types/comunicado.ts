export type Comunicado = {
  id: number
  titulo: string
  categoria: string
  conteudo: string
  setor_origem_id: number
  responsavel_nome: string
  responsavel_email: string
  tipo_confirmacao: 'assinatura' | 'email'
  status: 'rascunho' | 'aguardando_envio' | 'enviado' | 'parcialmente_confirmado' | 'confirmado' | 'fechado' | 'cancelado'
  hash_conteudo: string
  data_criacao: string | null
  data_publicacao: string | null
  data_fechamento: string | null
  created_at: string
  updated_at: string
}

export type ComunicadoDestinatario = {
  id: number
  comunicado_id: number
  funcionario_id: number
  setor_id: number
  unidade_id: number
  status: 'pendente' | 'enviado' | 'visualizado' | 'confirmado' | 'expirado' | 'erro_envio' | 'cancelado'
  metodo_confirmacao: 'assinatura' | 'email'
  token_confirmacao: string | null
  token_expira_em: string | null
  token_utilizado_em: string | null
  data_envio_email: string | null
  data_visualizacao: string | null
  data_confirmacao: string | null
  ip_confirmacao: string | null
  user_agent_confirmacao: string | null
  origem_destinatario: 'individual' | 'selecao_manual' | 'setor'
  created_at: string
  updated_at: string
  funcionarios?: { nome: string; email: string }
}

export type ComunicadoAnexo = {
  id: number
  comunicado_id: number
  nome_arquivo: string
  caminho_arquivo: string
  tipo_arquivo: string
  tamanho_bytes: number
  created_at: string
  updated_at: string
}
