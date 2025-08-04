import { NextRequest } from "next/server"
import { apiForward, successResponse, errorResponse, requireAuth, validateBody } from "@/lib/api-middleware"
import { createLinkSchema } from "@/lib/validations"

// Get all links for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = requireAuth(request)
    if (!authHeader) {
      return errorResponse("Unauthorized", 401)
    }

    const response = await apiForward("/api/links", {
      method: "GET",
    }, authHeader)

    const data = await response.json()

    if (!response.ok) {
      return errorResponse(
        data.error || "Failed to fetch links",
        response.status
      )
    }

    return successResponse(data)
  } catch (error) {
    console.error("Links API GET error:", error)
    return errorResponse("Failed to fetch links", 500)
  }
}

// Create a new link
export async function POST(request: NextRequest) {
  try {
    const authHeader = requireAuth(request)
    if (!authHeader) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()
    const validatedData = validateBody(body, createLinkSchema)

    const response = await apiForward("/api/links", {
      method: "POST",
      body: JSON.stringify(validatedData),
    }, authHeader)

    const data = await response.json()

    if (!response.ok) {
      return errorResponse(
        data.error || "Failed to create link",
        response.status
      )
    }

    return successResponse(data, 201)
  } catch (error) {
    console.error("Links API POST error:", error)
    return errorResponse("Failed to create link", 500)
  }
}