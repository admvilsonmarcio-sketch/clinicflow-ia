export enum MedicalErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    PATIENT_NOT_FOUND = 'PATIENT_NOT_FOUND',
    APPOINTMENT_CONFLICT = 'APPOINTMENT_CONFLICT',
    CLINIC_NOT_FOUND = 'CLINIC_NOT_FOUND',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

export class MedicalError extends Error {
    constructor(
        public type: MedicalErrorType,
        public userMessage: string,
        public technicalMessage: string,
        public context?: Record<string, any>
    ) {
        super(technicalMessage)
        this.name = 'MedicalError'
    }
}

export const createMedicalError = (
    type: MedicalErrorType,
    technicalMessage: string,
    context?: Record<string, any>
): MedicalError => {
    const userMessages = {
        [MedicalErrorType.VALIDATION_ERROR]: 'Dados inválidos. Verifique os campos e tente novamente.',
        [MedicalErrorType.DATABASE_ERROR]: 'Erro interno do sistema. Tente novamente em alguns instantes.',
        [MedicalErrorType.PERMISSION_ERROR]: 'Você não tem permissão para realizar esta ação.',
        [MedicalErrorType.PATIENT_NOT_FOUND]: 'Paciente não encontrado.',
        [MedicalErrorType.APPOINTMENT_CONFLICT]: 'Conflito de horário. Escolha outro horário.',
        [MedicalErrorType.CLINIC_NOT_FOUND]: 'Clínica não encontrada.',
        [MedicalErrorType.AUTHENTICATION_ERROR]: 'Erro de autenticação. Faça login novamente.',
        [MedicalErrorType.NETWORK_ERROR]: 'Erro de conexão. Verifique sua internet e tente novamente.',
        [MedicalErrorType.RATE_LIMIT_ERROR]: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.'
    }

    return new MedicalError(
        type,
        userMessages[type],
        technicalMessage,
        context
    )
}

// Função para converter erros comuns em MedicalError
export const convertToMedicalError = (error: unknown, context?: Record<string, any>): MedicalError => {
    if (error instanceof MedicalError) {
        return error
    }

    if (error instanceof Error) {
        // Detectar tipos de erro baseado na mensagem
        const message = error.message.toLowerCase()

        if (message.includes('not found') || message.includes('não encontrado')) {
            return createMedicalError(
                MedicalErrorType.PATIENT_NOT_FOUND,
                error.message,
                context
            )
        }

        if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
            return createMedicalError(
                MedicalErrorType.PERMISSION_ERROR,
                error.message,
                context
            )
        }

        if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
            return createMedicalError(
                MedicalErrorType.NETWORK_ERROR,
                error.message,
                context
            )
        }

        if (message.includes('rate limit') || message.includes('too many requests')) {
            return createMedicalError(
                MedicalErrorType.RATE_LIMIT_ERROR,
                error.message,
                context
            )
        }

        // Erro genérico de banco de dados
        return createMedicalError(
            MedicalErrorType.DATABASE_ERROR,
            error.message,
            context
        )
    }

    // Erro desconhecido
    return createMedicalError(
        MedicalErrorType.DATABASE_ERROR,
        'Erro desconhecido',
        { originalError: error, ...context }
    )
}