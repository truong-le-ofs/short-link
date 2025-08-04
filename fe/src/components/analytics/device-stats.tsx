"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AnalyticsData } from "@/types"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip
} from "recharts"
import { Smartphone, Monitor, Tablet, HelpCircle } from "lucide-react"

interface TooltipPayload {
  payload: {
    device: string
    count: number
    percentage: string
  }
  value: number
}

interface DeviceStatsProps {
  data: AnalyticsData["top_devices"]
}

const DEVICE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0"
]

const getDeviceIcon = (device: string) => {
  const deviceLower = device.toLowerCase()
  if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
    return <Smartphone className="h-4 w-4" />
  } else if (deviceLower.includes('desktop') || deviceLower.includes('computer')) {
    return <Monitor className="h-4 w-4" />
  } else if (deviceLower.includes('tablet')) {
    return <Tablet className="h-4 w-4" />
  } else {
    return <HelpCircle className="h-4 w-4" />
  }
}

export function DeviceStats({ data }: DeviceStatsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Analytics</CardTitle>
          <CardDescription>No device data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totalClicks = data.reduce((sum, item) => sum + item.count, 0)
  
  // Prepare data for charts
  const chartData = data.map((item, i) => ({
    ...item,
    percentage: ((item.count / totalClicks) * 100).toFixed(1),
    color: DEVICE_COLORS[i % DEVICE_COLORS.length]
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="font-medium">{data.device}</p>
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
      {/* Device Breakdown List */}
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>
            Click distribution by device type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {chartData.map((item) => (
            <div key={item.device} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getDeviceIcon(item.device)}
                  <span className="text-sm font-medium">{item.device}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
              <Progress 
                value={parseFloat(item.percentage)} 
                className="h-2"
                style={{ backgroundColor: `${item.color}20` }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Device Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Device Distribution</CardTitle>
          <CardDescription>
            Visual breakdown of device usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}