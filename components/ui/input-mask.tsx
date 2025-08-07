"use client"

import * as React from "react"
import { IMaskInput } from "react-imask"
import { cn } from "@/lib/utils"

export interface InputMaskProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  mask: string
  maskChar?: string | null
  value?: string
}

const InputWithMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  ({ className, mask, maskChar = "_", ...props }, ref) => {
    return (
      <IMaskInput
        mask={mask}
        placeholderChar={maskChar || "_"}
        {...props}
        inputRef={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    )
  }
)
InputWithMask.displayName = "InputWithMask"

export { InputWithMask }
