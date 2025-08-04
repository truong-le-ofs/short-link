import { NextRequest, NextResponse } from "next/server"

// Get all shortlinks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const url = `${process.env.NEXT_PUBLIC_API_URL}/shortlinks${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch shortlinks" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Shortlinks GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Create a new shortlink
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shortlinks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to create shortlink" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Shortlinks POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}