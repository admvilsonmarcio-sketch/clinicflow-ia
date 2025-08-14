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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-900 mb-2">⚠️</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Algo deu errado!
              </h2>
              <p className="text-gray-600 mb-8">
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