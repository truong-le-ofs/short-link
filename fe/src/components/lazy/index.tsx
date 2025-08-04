"use client"

import dynamic from "next/dynamic"
import React, { ComponentProps } from "react"
import { FormSkeleton } from "@/components/ui/loading-skeletons"

// Simple loading components
const ChartLoading = () => (
  <div className="h-[300px] animate-pulse bg-muted rounded" />
)

const DeviceStatsLoading = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <div className="h-[400px] animate-pulse bg-muted rounded" />
    <div className="h-[400px] animate-pulse bg-muted rounded" />
  </div>
)

const TableLoading = () => (
  <div className="space-y-4">
    <div className="h-[400px] animate-pulse bg-muted rounded" />
  </div>
)

const FormLoading = () => (
  <div className="space-y-4">
    <div className="h-[600px] animate-pulse bg-muted rounded" />
  </div>
)

// Lazy load heavy analytics components
export const AnalyticsDashboard = dynamic(
  () => import("@/components/analytics/analytics-dashboard").then(mod => ({ 
    default: mod.AnalyticsDashboard 
  })),
  {
    loading: FormSkeleton,
    ssr: false, // Disable SSR for charts to avoid hydration issues
  }
)

export const ClicksChart = dynamic(
  () => import("@/components/analytics/clicks-chart").then(mod => ({ 
    default: mod.ClicksChart 
  })),
  {
    loading: ChartLoading,
    ssr: false,
  }
)

export const DeviceStats = dynamic(
  () => import("@/components/analytics/device-stats").then(mod => ({ 
    default: mod.DeviceStats 
  })),
  {
    loading: DeviceStatsLoading,
    ssr: false,
  }
)

export const GeographicStats = dynamic(
  () => import("@/components/analytics/geographic-stats").then(mod => ({ 
    default: mod.GeographicStats 
  })),
  {
    loading: DeviceStatsLoading,
    ssr: false,
  }
)

// Lazy load link management components
export const SimpleLinkTable = dynamic(
  () => import("@/components/forms/simple-link-table").then(mod => ({ 
    default: mod.SimpleLinkTable 
  })),
  {
    loading: TableLoading,
  }
)

export const LinkForm = dynamic(
  () => import("@/components/forms/link-form").then(mod => ({ 
    default: mod.LinkForm 
  })),
  {
    loading: FormLoading,
  }
)

// Lazy load complex UI components
export const Calendar = dynamic(
  () => import("@/components/ui/calendar").then(mod => ({ 
    default: mod.Calendar 
  })),
  {
    loading: ChartLoading,
  }
)

// Helper type for lazy component props
export type LazyComponentProps<T extends React.ComponentType<Record<string, unknown>>> = ComponentProps<T>

// Preload function for critical routes
export const preloadAnalytics = () => {
  import("@/components/analytics/analytics-dashboard")
  import("@/components/analytics/clicks-chart")
  import("@/components/analytics/device-stats")
  import("@/components/analytics/geographic-stats")
}

export const preloadLinks = () => {
  import("@/components/forms/simple-link-table")
  import("@/components/forms/link-form")
}

// Route-based preloading
export const routePreloaders = {
  "/analytics": preloadAnalytics,
  "/links": preloadLinks,
  "/dashboard": () => {
    // Preload commonly used components on dashboard
    import("@/components/forms/simple-link-table")
  },
} as const