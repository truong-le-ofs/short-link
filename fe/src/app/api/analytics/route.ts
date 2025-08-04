import { NextRequest } from "next/server"
import { apiForward, successResponse, errorResponse, requireAuth } from "@/lib/api-middleware"

// Get analytics data for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = requireAuth(request)
    if (!authHeader) {
      return errorResponse("Unauthorized", 401)
    }

    const response = await apiForward("/api/analytics", {
      method: "GET",
    }, authHeader)

    const data = await response.json()

    if (!response.ok) {
      return errorResponse(
        data.error || "Failed to fetch analytics",
        response.status
      )
    }

    return successResponse(data)
  } catch (error) {
    console.error("Analytics API GET error:", error)
    return errorResponse("Failed to fetch analytics", 500)
  }
}