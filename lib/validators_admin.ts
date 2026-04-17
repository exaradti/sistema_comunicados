import { z } from 'zod'

export const usuario_admin_criacao_schema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(6),
  ativo: z.boolean(),
  perfis: z.array(z.string().min(1)).min(1),
  setores_ids: z.array(z.number().int().positive()).default([]),
  unidades_ids: z.array(z.number().int().positive()).default([])
})

export const usuario_admin_atualizacao_schema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  ativo: z.boolean().optional(),
  perfis: z.array(z.string().min(1)).optional(),
  setores_ids: z.array(z.number().int().positive()).optional(),
  unidades_ids: z.array(z.number().int().positive()).optional()
})
