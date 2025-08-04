"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function useAuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Get the redirect URL from query params or default to dashboard
      const redirectTo = searchParams.get("redirect") || "/dashboard"
      
      // Validate the redirect URL to prevent open redirects
      const isValidRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      
      if (isValidRedirect) {
        router.push(redirectTo)
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  return { isAuthenticated, isLoading }
}

export function useRequireAuth(redirectTo: string = "/login") {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Add current path as redirect parameter
      const currentPath = window.location.pathname
      const redirectUrl = currentPath !== "/" 
        ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
        : redirectTo
      
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, redirectTo, router])

  return { isAuthenticated, isLoading }
}