export type Comunicado = {
  id: number
  titulo: string
  categoria: string
  conteudo: string
  tipo_confirmacao: string
  status: string
}

export type Destinatario = {
  id: number
  funcionario_id: number
  status: string
  metodo_confirmacao: string
  data_envio_email?: string | null
  data_visualizacao?: string | null
  data_confirmacao?: string | null
}

export type Anexo = {
  id: number
  nome_arquivo: string
  tipo_arquivo: string
  tamanho_bytes: number
}

export type ObterComunicadoResponse = {
  comunicado: Comunicado
  destinatarios: Destinatario[]
  anexos: Anexo[]
}
