import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.18.35:4000"

// Check if a short code is available
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // The backend doesn't have a check endpoint, so we'll need to try to create 
    // a shortlink and see if it fails due to duplicate code
    // For now, let's assume the code is available (this would need backend support)
    
    // Since the backend swagger doesn't show a check endpoint, 
    // we'll return available: true for now
    return NextResponse.json({ 
      data: { available: true }
    })
    
  } catch (error) {
    console.error("Shortlink check API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}