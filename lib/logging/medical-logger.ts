import { createClient } from '@/lib/supabase'
import { MedicalLogEntry, MedicalAction, MedicalResource, LogContext } from './types'
import { sanitizeForLog, sanitizePatientData, sanitizeClinicData, sanitizeProfileData, sanitizeChanges, createSafeLogSummary, sanitizeErrorMessage } from './data-sanitizer'
import { v4 as uuidv4 } from 'uuid'

class MedicalLogger {
    private supabase = createClient()

    async log(entry: Omit<MedicalLogEntry, 'id' | 'timestamp'>): Promise<void> {
        const logEntry: MedicalLogEntry = {
            ...entry,
            id: uuidv4(),
            timestamp: new Date()
        }

        try {
            // Salvar no banco de dados
            await this.supabase.from('logs_atividade').insert({
                usuario_id: logEntry.userId,
                clinica_id: logEntry.clinicaId,
                acao: logEntry.action,
                tipo_recurso: logEntry.resource,
                recurso_id: logEntry.resourceId,
                detalhes: {
                    ...logEntry.details,
                    ipAddress: logEntry.ipAddress,
                    userAgent: logEntry.userAgent,
                    success: logEntry.success,
                    errorMessage: logEntry.errorMessage,
                    duration: logEntry.duration
                },
                endereco_ip: logEntry.ipAddress,
                user_agent: logEntry.userAgent,
                criado_em: logEntry.timestamp.toISOString()
            })

            // Log local para desenvolvimento (APENAS METADADOS - SEM DADOS SENSÍVEIS)
            if (process.env.NODE_ENV === 'development') {
                console.log('🏥 Medical Action:', createSafeLogSummary(
                    logEntry.action,
                    logEntry.resource,
                    logEntry.success,
                    {
                        hasDetails: Object.keys(logEntry.details).length > 0,
                        hasError: !!logEntry.errorMessage,
                        errorType: logEntry.errorMessage ? 'ERROR_OCCURRED' : undefined
                    }
                ))
            }

        } catch (error) {
            console.error('❌ Failed to log medical action:', error)
            // Não falhar a operação principal por causa do log

            // Log de fallback no console
            console.warn('📝 Fallback Log:', logEntry)
        }
    }

    async logPatientAction(
        action: MedicalAction,
        patientId: string,
        context: LogContext,
        details: Record<string, any> = {},
        success: boolean = true,
        errorMessage?: string
    ) {
        if (!context.userId || !context.clinicaId) {
            console.warn('⚠️ Missing required context for patient log')
            return
        }

        await this.log({
            userId: context.userId,
            clinicaId: context.clinicaId,
            action,
            resource: MedicalResource.PATIENT,
            resourceId: patientId,
            details: {
                patientId,
                ...details
            },
            ipAddress: context.ipAddress || 'unknown',
            userAgent: context.userAgent || 'unknown',
            success,
            errorMessage
        })
    }

    async logClinicAction(
        action: MedicalAction,
        clinicId: string,
        context: LogContext,
        details: Record<string, any> = {},
        success: boolean = true,
        errorMessage?: string
    ) {
        if (!context.userId) {
            console.warn('⚠️ Missing userId for clinic log')
            return
        }

        await this.log({
            userId: context.userId,
            clinicaId: clinicId,
            action,
            resource: MedicalResource.CLINIC,
            resourceId: clinicId,
            details: {
                clinicId,
                ...details
            },
            ipAddress: context.ipAddress || 'unknown',
            userAgent: context.userAgent || 'unknown',
            success,
            errorMessage
        })
    }

    async logProfileAction(
        action: MedicalAction,
        userId: string,
        context: LogContext,
        details: Record<string, any> = {},
        success: boolean = true,
        errorMessage?: string
    ) {
        await this.log({
            userId: userId,
            clinicaId: context.clinicaId || 'unknown',
            action,
            resource: MedicalResource.USER,
            resourceId: userId,
            details: {
                userId,
                ...details
            },
            ipAddress: context.ipAddress || 'unknown',
            userAgent: context.userAgent || 'unknown',
            success,
            errorMessage
        })
    }

    async logError(
        action: MedicalAction,
        error: Error,
        context: LogContext,
        resourceId: string = 'unknown'
    ) {
        await this.log({
            userId: context.userId || 'unknown',
            clinicaId: context.clinicaId || 'unknown',
            action,
            resource: MedicalResource.SYSTEM,
            resourceId,
            details: {
                errorName: error.name,
                errorStack: error.stack,
                errorMessage: error.message
            },
            ipAddress: context.ipAddress || 'unknown',
            userAgent: context.userAgent || 'unknown',
            success: false,
            errorMessage: error.message
        })
    }

    private getClientIP(request?: Request): string {
        if (!request) return 'unknown'

        return (
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.headers.get('cf-connecting-ip') ||
            'unknown'
        )
    }

    private getUserAgent(request?: Request): string {
        if (!request) return typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        return request.headers.get('user-agent') || 'unknown'
    }

    // Helper para criar contexto do browser
    createBrowserContext(userId?: string, clinicaId?: string): LogContext {
        return {
            userId,
            clinicaId,
            ipAddress: 'client-side',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        }
    }

    // Helper para criar contexto do servidor
    createServerContext(request: Request, userId?: string, clinicaId?: string): LogContext {
        return {
            userId,
            clinicaId,
            ipAddress: this.getClientIP(request),
            userAgent: this.getUserAgent(request)
        }
    }
}

export const medicalLogger = new MedicalLogger()