import { z } from 'zod'

export const clinicaSchema = z.object({
    nome: z.string()
        .min(2, "Nome da clínica deve ter pelo menos 2 caracteres")
        .max(100, "Nome da clínica muito longo"),

    descricao: z.string()
        .max(500, "Descrição muito longa")
        .optional()
        .or(z.literal("")),

    endereco: z.string()
        .max(200, "Endereço muito longo")
        .optional()
        .or(z.literal("")),

    telefone: z.string()
        .regex(/^\(\d{2}\) \d{4}-\d{4}$/, "Formato inválido. Use: (11) 3333-3333")
        .optional()
        .or(z.literal("")),

    email: z.string()
        .refine((email) => {
            if (!email || email === "") return true // String vazia é válida
            return z.string().email().safeParse(email).success
        }, "Email inválido. Use o formato: exemplo@email.com")
        .optional(),

    site: z.string()
        .url("URL inválida. Deve começar com http:// ou https://")
        .optional()
        .or(z.literal(""))
})

export type ClinicaFormData = z.infer<typeof clinicaSchema>

// Schema para criação (nome obrigatório)
export const clinicaCreateSchema = clinicaSchema.extend({
    nome: z.string()
        .min(2, "Nome da clínica é obrigatório")
        .max(100, "Nome da clínica muito longo")
})

// Schema para atualização (todos opcionais)
export const clinicaUpdateSchema = clinicaSchema.partial()
