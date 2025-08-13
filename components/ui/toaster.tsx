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
        return <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-600 sm:size-5" />
      case 'destructive':
        return <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600 sm:size-5" />
      case 'warning':
        return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600 sm:size-5" />
      default:
        return <Info className="mt-0.5 size-4 shrink-0 text-blue-600 sm:size-5" />
    }
  }

  return (
    <ToastProvider duration={6000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex flex-1 items-start space-x-3">
              {getToastIcon(props.variant || 'default')}
              <div className="min-w-0 flex-1">
                {title && (
                  <ToastTitle className="text-base font-semibold leading-tight">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="mt-1 text-sm leading-relaxed opacity-80">
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
