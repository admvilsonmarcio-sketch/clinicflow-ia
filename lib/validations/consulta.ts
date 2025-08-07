import { z } from 'zod'

export const consultaSchema = z.object({
    titulo: z.string()
        .min(2, "Título deve ter pelo menos 2 caracteres")
        .max(100, "Título muito longo"),

    descricao: z.string()
        .max(500, "Descrição muito longa")
        .optional(),

    data_consulta: z.string()
        .refine((date) => {
            const consultaDate = new Date(date)
            const hoje = new Date()
            return consultaDate > hoje
        }, "Data da consulta deve ser futura"),

    duracao_minutos: z.number()
        .min(15, "Consulta deve ter pelo menos 15 minutos")
        .max(480, "Consulta não pode durar mais que 8 horas")
        .default(60),

    status: z.enum(['agendada', 'confirmada', 'realizada', 'cancelada', 'faltou'])
        .default('agendada'),

    observacoes: z.string()
        .max(1000, "Observações muito longas")
        .optional()
})

export type ConsultaFormData = z.infer<typeof consultaSchema>

// Schema para criação (campos obrigatórios)
export const consultaCreateSchema = consultaSchema.extend({
    titulo: z.string()
        .min(2, "Título é obrigatório")
        .max(100, "Título muito longo"),
    data_consulta: z.string()
        .min(1, "Data da consulta é obrigatória")
})

// Schema para atualização (todos opcionais)
export const consultaUpdateSchema = consultaSchema.partial()
