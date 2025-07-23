import { z } from 'zod'

export const pacienteSchema = z.object({
    nome_completo: z.string()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(100, "Nome muito longo")
        .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),

    telefone: z.string()
        .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato inválido. Use: (11) 99999-9999"),

    email: z.string()
        .refine((email) => {
            if (!email || email === "") return true // String vazia é válida
            return z.string().email().safeParse(email).success
        }, "Email inválido. Use o formato: exemplo@email.com")
        .optional(),

    data_nascimento: z.string()
        .refine((date) => {
            if (!date || date === "") return true // String vazia é válida
            const nascimento = new Date(date)
            if (isNaN(nascimento.getTime())) return false
            const hoje = new Date()
            const idade = hoje.getFullYear() - nascimento.getFullYear()
            return idade >= 0 && idade <= 120
        }, "Data de nascimento inválida")
        .optional(),

    genero: z.enum(['masculino', 'feminino', 'outro']).optional(),

    endereco: z.string()
        .max(200, "Endereço muito longo")
        .optional(),

    contato_emergencia: z.string()
        .max(100, "Nome do contato muito longo")
        .optional(),

    telefone_emergencia: z.string()
        .refine((phone) => {
            if (!phone || phone === "") return true // String vazia é válida
            return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone)
        }, "Formato inválido. Use: (11) 99999-9999")
        .optional(),

    historico_medico: z.string()
        .max(2000, "Histórico médico muito longo")
        .optional(),

    alergias: z.string()
        .max(500, "Lista de alergias muito longa")
        .optional(),

    medicamentos: z.string()
        .max(1000, "Lista de medicamentos muito longa")
        .optional(),

    observacoes: z.string()
        .max(1000, "Observações muito longas")
        .optional()
})

export type PacienteFormData = z.infer<typeof pacienteSchema>

// Schema para validação de criação (campos obrigatórios)
export const pacienteCreateSchema = pacienteSchema.extend({
    nome_completo: z.string()
        .min(2, "Nome completo é obrigatório")
        .max(100, "Nome muito longo"),
    telefone: z.string()
        .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone é obrigatório e deve estar no formato (11) 99999-9999")
})

// Schema para validação de atualização (todos opcionais exceto ID)
export const pacienteUpdateSchema = pacienteSchema.partial()