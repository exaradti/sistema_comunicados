import { z } from 'zod'

export const funcionario_schema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  setor_id: z.number().int().positive(),
  unidade_id: z.number().int().positive(),
  ativo: z.boolean()
})

export const setor_schema = z.object({
  nome: z.string().min(1),
  ativo: z.boolean()
})

export const unidade_schema = z.object({
  nome: z.string().min(1),
  ativo: z.boolean()
})

export const comunicado_assinatura_schema = z.object({
  comunicado_destinatario_id: z.number().int().positive(),
  nome_assinante: z.string().min(1),
  assinatura_base64: z.string().min(20)
})

export const comunicado_email_schema = z.object({
  titulo: z.string().min(1),
  categoria: z.string().min(1),
  conteudo: z.string().min(1),
  setor_origem_id: z.number().int().positive(),
  responsavel_nome: z.string().min(1),
  responsavel_email: z.string().email(),
  tipo_confirmacao: z.literal('email'),
  funcionarios_ids: z.array(z.number().int().positive()).default([]),
  setores_ids: z.array(z.number().int().positive()).default([])
})

export const comunicado_assinatura_criacao_schema = z.object({
  titulo: z.string().min(1),
  categoria: z.string().min(1),
  conteudo: z.string().min(1),
  setor_origem_id: z.number().int().positive(),
  responsavel_nome: z.string().min(1),
  responsavel_email: z.string().email(),
  tipo_confirmacao: z.literal('assinatura'),
  funcionario_id: z.number().int().positive()
})
