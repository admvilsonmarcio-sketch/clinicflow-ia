export interface MedicalLogEntry {
    id: string
    timestamp: Date
    userId: string
    clinicaId: string
    action: MedicalAction
    resource: MedicalResource
    resourceId: string
    details: Record<string, any>
    ipAddress: string
    userAgent: string
    success: boolean
    errorMessage?: string
    duration?: number
}

export enum MedicalAction {
    // Autenticação
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',

    // Pacientes
    CREATE_PATIENT = 'CREATE_PATIENT',
    UPDATE_PATIENT = 'UPDATE_PATIENT',
    DELETE_PATIENT = 'DELETE_PATIENT',
    VIEW_PATIENT = 'VIEW_PATIENT',
    SEARCH_PATIENT = 'SEARCH_PATIENT',

    // Consultas
    CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
    UPDATE_APPOINTMENT = 'UPDATE_APPOINTMENT',
    CANCEL_APPOINTMENT = 'CANCEL_APPOINTMENT',
    VIEW_APPOINTMENT = 'VIEW_APPOINTMENT',

    // Clínica
    UPDATE_CLINIC = 'UPDATE_CLINIC',
    VIEW_CLINIC = 'VIEW_CLINIC',

    // Perfil
    UPDATE_PROFILE = 'UPDATE_PROFILE',
    VIEW_PROFILE = 'VIEW_PROFILE',

    // Sistema
    SYSTEM_ERROR = 'SYSTEM_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export enum MedicalResource {
    PATIENT = 'PATIENT',
    APPOINTMENT = 'APPOINTMENT',
    CLINIC = 'CLINIC',
    USER = 'USER',
    SYSTEM = 'SYSTEM'
}

export interface LogContext {
    userId?: string
    clinicaId?: string
    ipAddress?: string
    userAgent?: string
}