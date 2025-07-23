import { z } from 'zod'

export const perfilSchema = z.object({
    nome_completo: z.string()
        .min(2, "Nome completo deve ter pelo menos 2 caracteres")
        .max(100, "Nome muito longo")
        .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),

    email: z.string()
        .email("Email inválido"),

    telefone: z.string()
        .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato inválido. Use: (11) 99999-9999")
        .optional()
        .or(z.literal("")),

    cargo: z.enum(['admin', 'medico', 'assistente', 'recepcionista'], {
        errorMap: () => ({ message: "Cargo deve ser: admin, médico, assistente ou recepcionista" })
    }).optional()
})

export type PerfilFormData = z.infer<typeof perfilSchema>

// Schema para criação (campos obrigatórios)
export const perfilCreateSchema = perfilSchema.extend({
    nome_completo: z.string()
        .min(2, "Nome completo é obrigatório")
        .max(100, "Nome muito longo"),
    email: z.string()
        .email("Email é obrigatório e deve ser válido")
})

// Schema para atualização (todos opcionais exceto validações)
export const perfilUpdateSchema = perfilSchema.partial().extend({
    // Email não pode ser alterado via formulário (apenas via Supabase Auth)
    email: z.string().email().optional()
})