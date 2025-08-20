'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="mb-8">
              <h1 className="mb-2 text-6xl font-bold text-gray-900">⚠️</h1>
              <h2 className="mb-4 text-2xl font-semibold text-gray-700">
                Algo deu errado!
              </h2>
              <p className="mb-8 text-gray-600">
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button onClick={reset} className="w-full">
                Tentar novamente
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Voltar ao início
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}