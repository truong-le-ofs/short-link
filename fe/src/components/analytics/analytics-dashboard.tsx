"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsData } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { AnalyticsCards } from "./analytics-cards"
import { ClicksChart } from "./clicks-chart"
import { DeviceStats } from "./device-stats"
import { GeographicStats } from "./geographic-stats"
import { LoadingSkeleton } from "./analytics-loading"

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { apiCall } = useAuth()
  const { toast } = useToast()

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiCall<AnalyticsData>("/api/analytics")
      setAnalyticsData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics"
      setError(errorMessage)
      toast.error("Analytics Error", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Analytics</CardTitle>
          <CardDescription>
            {error || "Failed to load analytics data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <AnalyticsCards data={analyticsData} />

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
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
    </div>
  )
}