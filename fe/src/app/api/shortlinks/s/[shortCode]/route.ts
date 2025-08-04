import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.18.35:4000"

// Access a shortlink (POST method for password support)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params
    const authHeader = request.headers.get("authorization")
    
    const body = await request.json().catch(() => ({}))

    const response = await fetch(`${API_BASE_URL}/shortlinks/s/${encodeURIComponent(shortCode)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Failed to access shortlink" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Shortlink access API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Direct redirect (GET method)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params

    const response = await fetch(`${API_BASE_URL}/shortlinks/s/${encodeURIComponent(shortCode)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 302) {
      // Handle redirect
      const location = response.headers.get('location')
      if (location) {
        return NextResponse.redirect(location)
      }
    }

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Shortlink not found" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Shortlink redirect API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}