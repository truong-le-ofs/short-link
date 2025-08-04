import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://192.168.18.35:4000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward request to backend signin endpoint
    const response = await fetch(`${BACKEND_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.errors || 'Login failed' },
        { status: response.status }
      )
    }

    // Backend returns { statusCode, data: { user, accessToken }, errors, message }
    // Format response to match frontend expectations
    return NextResponse.json({
      data: {
        user: data.data.user,
        token: data.data.accessToken,
      },
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}