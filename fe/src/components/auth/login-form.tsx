"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from 'next-intl'

type LoginFormData = {
  email: string
  password: string
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth.login')
  const tValidation = useTranslations('auth.validation')

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, tValidation('emailRequired'))
      .email(tValidation('emailInvalid')),
    password: z
      .string()
      .min(1, tValidation('passwordRequired'))
      .min(8, tValidation('passwordMin')),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      
      // Get redirect URL from search params or default to dashboard
      const redirectTo = searchParams.get("redirect") || "/dashboard"
      const isValidRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      
      router.push(isValidRedirect ? redirectTo : "/dashboard")
    } catch (error) {
      // Errors are handled by the auth context and displayed via toast
      // Set form-level errors if needed
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes("email")) {
          setError("email", { message: error.message })
        } else if (error.message.toLowerCase().includes("password")) {
          setError("password", { message: error.message })
        }
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t('title')}</CardTitle>
        <CardDescription className="text-center">
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              {...register("email")}
              disabled={isLoading}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-sm text-red-500" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('passwordPlaceholder')}
                {...register("password")}
                disabled={isLoading}
                aria-invalid={errors.password ? "true" : "false"}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
                <span className="sr-only">
                  {showPassword ? t('hidePassword') : t('showPassword')}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t('signingIn')}
              </>
            ) : (
              t('signIn')
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t('noAccount')} </span>
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              {t('signUp')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}