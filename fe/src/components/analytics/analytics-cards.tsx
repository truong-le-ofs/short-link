"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsData } from "@/types"
import { BarChart3, Globe, Users, TrendingUp, Calendar, Clock } from "lucide-react"

interface AnalyticsCardsProps {
  data: AnalyticsData
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_clicks.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            All time clicks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.unique_visitors.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Unique visitors
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.clicks_today.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Clicks today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.clicks_this_week.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Clicks this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.clicks_this_month.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Clicks this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Daily</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.daily_clicks.length > 0 
              ? Math.round(data.daily_clicks.reduce((sum, day) => sum + day.clicks, 0) / data.daily_clicks.length).toLocaleString()
              : "0"
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Average daily clicks
          </p>
        </CardContent>
      </Card>
    </div>
  )
}