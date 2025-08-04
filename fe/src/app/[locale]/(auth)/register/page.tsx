"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Container } from "@/components/ui/container"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function RegisterPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <Container className="flex min-h-screen items-center justify-center py-12">
        <RegisterForm />
      </Container>
    </ProtectedRoute>
  )
}