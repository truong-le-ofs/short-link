"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useAnalytics } from "@/hooks/use-api"
import { AnalyticsCards } from "./analytics-cards"
import { LoadingSkeleton } from "./analytics-loading"

// Lazy load chart components
import { ClicksChart, DeviceStats, GeographicStats } from "@/components/lazy"

export function OptimizedAnalyticsDashboard() {
  const { 
    data: analyticsData, 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useAnalytics()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error Loading Analytics
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Failed to load analytics data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="outline"
          >
            {isRefetching ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">
            Track your link performance and user engagement
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          size="sm"
        >
          {isRefetching ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards data={analyticsData} />

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            📊 Overview
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            📱 Devices
          </TabsTrigger>
          <TabsTrigger value="geography" className="flex items-center gap-2">
            🌍 Geography
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clicks Over Time</CardTitle>
              <CardDescription>
                Daily click performance for the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClicksChart data={analyticsData.daily_clicks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceStats data={analyticsData.top_devices} />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <GeographicStats data={analyticsData.top_countries} />
        </TabsContent>
      </Tabs>

      {/* Data freshness indicator */}
      <div className="text-xs text-muted-foreground text-center">
        Data refreshes automatically every 5 minutes • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}