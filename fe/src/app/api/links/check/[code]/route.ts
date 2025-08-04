import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Check if a short code is available
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { code } = await params
    
    // Basic validation
    if (!code || code.length < 3 || code.length > 20) {
      return NextResponse.json(
        { error: "Invalid code length. Code must be between 3 and 20 characters." },
        { status: 400 }
      )
    }

    // Check if code contains only allowed characters
    if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid code format. Only letters, numbers, hyphens, and underscores are allowed." },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/api/links/check/${encodeURIComponent(code)}`, {
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to check code availability" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Check code API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}