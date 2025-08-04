"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress" 
import { AnalyticsData } from "@/types"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts"
import { Globe } from "lucide-react"

interface TooltipPayload {
  payload: {
    country: string
    count: number
    percentage: string
    flag: string
  }
  value: number
}

interface GeographicStatsProps {
  data: AnalyticsData["top_countries"]
}

const COUNTRY_COLORS = [
  "hsl(var(--primary))",
  "hsl(220, 91%, 56%)",
  "hsl(142, 71%, 45%)",
  "hsl(47, 96%, 53%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 100%, 70%)",
  "hsl(20, 100%, 60%)",
  "hsl(200, 100%, 50%)"
]

// Function to get country flag emoji (basic implementation)
const getCountryFlag = (country: string) => {
  const countryFlags: { [key: string]: string } = {
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    'Australia': '🇦🇺',
    'Brazil': '🇧🇷',
    'India': '🇮🇳',
    'China': '🇨🇳',
    'Russia': '🇷🇺',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Netherlands': '🇳🇱',
    'Mexico': '🇲🇽',
    'South Korea': '🇰🇷',
    'Sweden': '🇸🇪',
    'Switzerland': '🇨🇭',
    'Singapore': '🇸🇬',
    'Unknown': '🌍'
  }
  return countryFlags[country] || '🌍'
}

export function GeographicStats({ data }: GeographicStatsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Analytics</CardTitle>
          <CardDescription>No geographic data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totalClicks = data.reduce((sum, item) => sum + item.count, 0)
  
  // Prepare data for charts
  const chartData = data.map((item, index) => ({
    ...item,
    percentage: ((item.count / totalClicks) * 100).toFixed(1),
    color: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
    flag: getCountryFlag(item.country)
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="font-medium flex items-center gap-2">
            <span>{data.flag}</span>
            {data.country}
          </p>
          <p className="text-sm text-muted-foreground">
            Clicks: <span className="font-medium text-foreground">{data.count.toLocaleString()}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">{data.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Country List */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
          <CardDescription>
            Click distribution by country
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {chartData.map((item) => (
            <div key={item.country} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.flag}</span>
                  <span className="text-sm font-medium">{item.country}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
              <Progress 
                value={parseFloat(item.percentage)} 
                className="h-2"
              />
            </div>
          ))}
          
          {totalClicks > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Total</span>
                </div>
                <span className="font-medium">{totalClicks.toLocaleString()} clicks</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geographic Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>
            Visual breakdown of clicks by country
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="country" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}