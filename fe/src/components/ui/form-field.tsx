"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
  description?: string
}

export function FormField({ 
  label, 
  error, 
  required, 
  children, 
  className,
  description 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {label}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
}

export function FormInput({ 
  label, 
  error, 
  description, 
  required, 
  className, 
  ...props 
}: FormInputProps) {
  return (
    <FormField 
      label={label} 
      error={error} 
      required={required}
      description={description}
      className={className}
    >
      <Input {...props} />
    </FormField>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  description?: string
}

export function FormTextarea({ 
  label, 
  error, 
  description, 
  required, 
  className, 
  ...props 
}: FormTextareaProps) {
  return (
    <FormField 
      label={label} 
      error={error} 
      required={required}
      description={description}
      className={className}
    >
      <textarea 
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props} 
      />
    </FormField>
  )
}