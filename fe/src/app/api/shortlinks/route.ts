import { NextRequest } from "next/server"
import { apiForward, successResponse, errorResponse, requireAuth, validateBody } from "@/lib/api-middleware"
import { createLinkSchema } from "@/lib/validations"

// Get all shortlinks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = requireAuth(request)
    if (!authHeader) {
      return errorResponse("Unauthorized", 401)
    }

    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const short_code = searchParams.get('short_code')
    const is_active = searchParams.get('is_active')

    let queryParams = `?page=${page}&limit=${limit}`
    if (short_code) queryParams += `&short_code=${encodeURIComponent(short_code)}`
    if (is_active) queryParams += `&is_active=${is_active}`

    const response = await apiForward(`/shortlinks${queryParams}`, {
      method: "GET",
    }, authHeader)

    const data = await response.json()

    if (!response.ok) {
      return errorResponse(
        data.error || "Failed to fetch shortlinks",
        response.status
      )
    }

    return successResponse(data)
  } catch (error) {
    console.error("Shortlinks API GET error:", error)
    return errorResponse("Failed to fetch shortlinks", 500)
  }
}

// Create a new shortlink
export async function POST(request: NextRequest) {
  try {
    const authHeader = requireAuth(request)
    if (!authHeader) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()
    const validatedData = validateBody(body, createLinkSchema)

    // Transform frontend field names to backend field names
    const backendData = {
      default_url: validatedData.url,
      short_code: validatedData.customCode,
      expires_at: validatedData.expiresAt,
      access_limit: validatedData.accessLimit,
    }

    const response = await apiForward("/shortlinks", {
      method: "POST",
      body: JSON.stringify(backendData),
    }, authHeader)

    const data = await response.json()

    if (!response.ok) {
      return errorResponse(
        data.error || "Failed to create shortlink",
        response.status
      )
    }

    return successResponse(data, 201)
  } catch (error) {
    console.error("Shortlinks API POST error:", error)
    return errorResponse("Failed to create shortlink", 500)
  }
}