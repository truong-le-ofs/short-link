import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], className)} 
    />
  )
}

interface LoadingOverlayProps {
  children?: React.ReactNode
  className?: string
}

export function LoadingOverlay({ children, className }: LoadingOverlayProps) {
  return (
    <div className={cn("flex items-center justify-center p-6", className)}>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="lg" />
        {children && (
          <p className="text-sm text-muted-foreground">{children}</p>
        )}
      </div>
    </div>
  )
}