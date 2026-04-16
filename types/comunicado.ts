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
  data_envio_email?: string
  data_visualizacao?: string
  data_confirmacao?: string
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
