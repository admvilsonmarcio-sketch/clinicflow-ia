"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant: string) => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      default:
        return <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
    }
  }

  return (
    <ToastProvider duration={6000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start space-x-3 flex-1">
              {getToastIcon(props.variant || 'default')}
              <div className="flex-1 min-w-0">
                {title && (
                  <ToastTitle className="text-base font-semibold leading-tight">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-sm opacity-80 leading-relaxed mt-1">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}