"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Container } from "@/components/ui/container"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <Container className="flex min-h-screen items-center justify-center py-12">
        <LoginForm />
      </Container>
    </ProtectedRoute>
  )
}