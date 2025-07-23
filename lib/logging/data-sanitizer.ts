/**
 * SANITIZADOR DE DADOS MÉDICOS SENSÍVEIS
 * Remove/mascara informações pessoais dos logs para compliance LGPD/HIPAA
 */

// Campos que NUNCA devem aparecer em logs
const SENSITIVE_FIELDS = [
    'nome_completo',
    'email',
    'telefone',
    'telefone_emergencia',
    'endereco',
    'data_nascimento',
    'historico_medico',
    'alergias',
    'medicamentos',
    'observacoes',
    'contato_emergencia',
    'cpf',
    'rg',
    'password',
    'senha'
]

// Campos que podem ser mascarados (mostrar apenas parte)
const MASKABLE_FIELDS = [
    'email',
    'telefone',
    'telefone_emergencia'
]

/**
 * Sanitiza dados removendo informações sensíveis
 */
export const sanitizeForLog = (data: any): any => {
    if (!data || typeof data !== 'object') {
        return data
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeForLog(item))
    }

    const sanitized: any = {}

    Object.keys(data).forEach(key => {
        const value = data[key]

        // Remover campos completamente sensíveis
        if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
            if (key.toLowerCase() === 'email' && value) {
                sanitized[key] = maskEmail(value)
            } else if ((key.toLowerCase() === 'telefone' || key.toLowerCase() === 'telefone_emergencia') && value) {
                sanitized[key] = maskPhone(value)
            } else {
                sanitized[key] = '[REDACTED]'
            }
        }
        // Recursivamente sanitizar objetos aninhados
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeForLog(value)
        }
        // Manter outros campos
        else {
            sanitized[key] = value
        }
    })

    return sanitized
}

/**
 * Mascara email: exemplo@email.com -> e****@e****.com
 */
const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return '[EMAIL_REDACTED]'

    const [local, domain] = email.split('@')
    const maskedLocal = local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] : '***'
    const maskedDomain = domain.length > 4 ? domain[0] + '*'.repeat(domain.length - 4) + domain.slice(-3) : '***'

    return `${maskedLocal}@${maskedDomain}`
}

/**
 * Mascara telefone: (11) 99999-9999 -> (11) 9****-**99
 */
const maskPhone = (phone: string): string => {
    if (!phone) return '[PHONE_REDACTED]'

    // Manter apenas formato e últimos 2 dígitos
    return phone.replace(/\d(?=\d{2})/g, '*')
}

/**
 * Sanitiza especificamente dados de paciente para logs
 */
export const sanitizePatientData = (patientData: any) => {
    return {
        id: patientData.id || '[NEW]',
        hasName: !!patientData.nome_completo,
        hasEmail: !!patientData.email,
        hasPhone: !!patientData.telefone,
        hasBirthDate: !!patientData.data_nascimento,
        hasAddress: !!patientData.endereco,
        hasMedicalHistory: !!patientData.historico_medico,
        hasAllergies: !!patientData.alergias,
        hasMedications: !!patientData.medicamentos,
        fieldCount: Object.keys(patientData).length
    }
}

/**
 * Sanitiza dados de clínica para logs
 */
export const sanitizeClinicData = (clinicData: any) => {
    return {
        id: clinicData.id || '[NEW]',
        hasName: !!clinicData.nome,
        hasEmail: !!clinicData.email,
        hasPhone: !!clinicData.telefone,
        hasAddress: !!clinicData.endereco,
        hasWebsite: !!clinicData.site,
        fieldCount: Object.keys(clinicData).length
    }
}

/**
 * Sanitiza dados de perfil para logs
 */
export const sanitizeProfileData = (profileData: any) => {
    return {
        id: profileData.id || '[NEW]',
        hasName: !!profileData.nome_completo,
        hasEmail: !!profileData.email,
        hasPhone: !!profileData.telefone,
        cargo: profileData.cargo, // Cargo não é sensível
        fieldCount: Object.keys(profileData).length
    }
}

/**
 * Cria resumo seguro de mudanças para logs
 */
export const sanitizeChanges = (changes: Record<string, { old: any, new: any }>) => {
    const sanitizedChanges: Record<string, string> = {}

    Object.keys(changes).forEach(field => {
        if (SENSITIVE_FIELDS.includes(field.toLowerCase())) {
            sanitizedChanges[field] = '[FIELD_CHANGED]'
        } else {
            sanitizedChanges[field] = `${changes[field].old} → ${changes[field].new}`
        }
    })

    return {
        changedFields: Object.keys(changes),
        changeCount: Object.keys(changes).length,
        changes: sanitizedChanges
    }
}

/**
 * Cria resumo seguro para logs de desenvolvimento
 */
export const createSafeLogSummary = (
    action: string,
    resource: string,
    success: boolean,
    metadata: Record<string, any> = {}
) => {
    return {
        action,
        resource,
        success,
        timestamp: new Date().toISOString(),
        metadata: sanitizeForLog(metadata)
    }
}

/**
 * Sanitiza mensagens de erro removendo dados sensíveis
 */
export const sanitizeErrorMessage = (errorMessage: string): string => {
    if (!errorMessage) return errorMessage

    // Remover emails
    let sanitized = errorMessage.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')

    // Remover telefones
    sanitized = sanitized.replace(/\(\d{2}\)\s?\d{4,5}-?\d{4}/g, '[PHONE_REDACTED]')

    // Remover possíveis nomes (palavras com mais de 2 caracteres maiúsculos)
    sanitized = sanitized.replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, '[NAME_REDACTED]')

    return sanitized
}