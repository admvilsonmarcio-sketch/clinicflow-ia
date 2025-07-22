"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ClinicSetup } from '@/components/setup/clinic-setup'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { UserProvider, useUser } from '@/contexts/user-context'
import { Loader2 } from 'lucide-react'

interface DashboardWrapperProps {
    children: React.ReactNode
    user: any
    initialProfile: any
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { user, profile, refreshProfile } = useUser()
    const [needsSetup, setNeedsSetup] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkSetup()
    }, [profile])

    const checkSetup = async () => {
        try {
            if (!profile || !profile.clinica_id) {
                setNeedsSetup(true)
            }
        } catch (error) {
            console.error('Erro ao verificar setup:', error)
            setNeedsSetup(true)
        } finally {
            setLoading(false)
        }
    }

    const handleSetupComplete = async () => {
        await refreshProfile()
        setNeedsSetup(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    if (needsSetup) {
        return <ClinicSetup onComplete={handleSetupComplete} />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar />
                <div className="flex-1">
                    <Header user={user} profile={profile} />
                    <main className="p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}

export function DashboardWrapper({ children, user, initialProfile }: DashboardWrapperProps) {
    return (
        <UserProvider initialUser={user} initialProfile={initialProfile}>
            <DashboardContent>
                {children}
            </DashboardContent>
        </UserProvider>
    )
}