"use client"

import { Container, PageHeader } from "@/components/ui/container"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <Container className="py-8">
        <PageHeader
          title="Analytics Dashboard"
          description="Detailed insights into your link performance"
        />
        <AnalyticsDashboard />
      </Container>
    </ProtectedRoute>
  )
}