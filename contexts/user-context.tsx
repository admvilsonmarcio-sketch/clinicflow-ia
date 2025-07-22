"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'

interface UserProfile {
    id: string
    email: string
    nome_completo: string
    foto_url?: string
    telefone?: string
    cargo: string
    clinica_id?: string
    clinicas?: {
        id: string
        nome: string
        descricao?: string
        endereco?: string
        telefone?: string
        email?: string
        site?: string
    }
}

interface UserContextType {
    user: any
    profile: UserProfile | null
    updateProfile: (updates: Partial<UserProfile>) => void
    updateClinic: (updates: any) => void
    refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
    children: ReactNode
    initialUser: any
    initialProfile: UserProfile | null
}

export function UserProvider({ children, initialUser, initialProfile }: UserProviderProps) {
    const [user] = useState(initialUser)
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
    const supabase = createClient()

    const updateProfile = (updates: Partial<UserProfile>) => {
        setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    const updateClinic = (updates: any) => {
        setProfile(prev =>
            prev ? {
                ...prev,
                clinicas: prev.clinicas ? { ...prev.clinicas, ...updates } : updates
            } : null
        )
    }

    const refreshProfile = async () => {
        if (!user?.id) return

        const { data } = await supabase
            .from('perfis')
            .select('*, clinicas(*)')
            .eq('id', user.id)
            .single()

        if (data) {
            setProfile(data)
        }
    }

    return (
        <UserContext.Provider value={{
            user,
            profile,
            updateProfile,
            updateClinic,
            refreshProfile
        }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}