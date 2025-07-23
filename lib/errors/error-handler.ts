import { MedicalError, MedicalErrorType, convertToMedicalError } from './medical-errors'
import { medicalLogger } from '@/lib/logging/medical-logger'
import { MedicalAction } from '@/lib/logging/types'
import { createSafeLogSummary, sanitizeErrorMessage } from '@/lib/logging/data-sanitizer'
import { toast } from '@/components/ui/use-toast'

interface ErrorContext {
    userId?: string
    clinicaId?: string
    action?: MedicalAction
    resourceId?: string
    additionalInfo?: Record<string, any>
}

export const handleMedicalError = async (
    error: unknown,
    context: ErrorContext
) => {
    const medicalError = convertToMedicalError(error, context.additionalInfo)

    // Log do erro se temos contexto suficiente
    if (context.userId && context.clinicaId && context.action) {
        await medicalLogger.logError(
            context.action,
            medicalError,
            medicalLogger.createBrowserContext(context.userId, context.clinicaId),
            context.resourceId
        )
    }

    // Mostrar erro para usuário
    toast({
        variant: "destructive",
        title: getMedicalErrorTitle(medicalError.type),
        description: medicalError.userMessage
    })

    // Log técnico para desenvolvimento (SEM DADOS SENSÍVEIS)
    if (process.env.NODE_ENV === 'development') {
        console.error('🏥 Medical Error:', createSafeLogSummary(
            'ERROR_OCCURRED',
            'SYSTEM',
            false,
            {
                errorType: medicalError.type,
                userMessage: sanitizeErrorMessage(medicalError.userMessage),
                hasTechnicalMessage: !!medicalError.technicalMessage,
                hasContext: !!medicalError.context
            }
        ))
    }

    return medicalError
}

const getMedicalErrorTitle = (type: MedicalErrorType): string => {
    const titles = {
        [MedicalErrorType.VALIDATION_ERROR]: 'Erro de Validação',
        [MedicalErrorType.DATABASE_ERROR]: 'Erro do Sistema',
        [MedicalErrorType.PERMISSION_ERROR]: 'Acesso Negado',
        [MedicalErrorType.PATIENT_NOT_FOUND]: 'Paciente Não Encontrado',
        [MedicalErrorType.APPOINTMENT_CONFLICT]: 'Conflito de Agendamento',
        [MedicalErrorType.CLINIC_NOT_FOUND]: 'Clínica Não Encontrada',
        [MedicalErrorType.AUTHENTICATION_ERROR]: 'Erro de Autenticação',
        [MedicalErrorType.NETWORK_ERROR]: 'Erro de Conexão',
        [MedicalErrorType.RATE_LIMIT_ERROR]: 'Limite Excedido'
    }

    return titles[type] || 'Erro'
}

// Helper para criar contexto de erro rapidamente
export const createErrorContext = (
    userId?: string,
    clinicaId?: string,
    action?: MedicalAction,
    resourceId?: string,
    additionalInfo?: Record<string, any>
): ErrorContext => ({
    userId,
    clinicaId,
    action,
    resourceId,
    additionalInfo
})

// Wrapper para operações que podem falhar
export const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    context: ErrorContext
): Promise<T | null> => {
    try {
        return await operation()
    } catch (error) {
        await handleMedicalError(error, context)
        return null
    }
}