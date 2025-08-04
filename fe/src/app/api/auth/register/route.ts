import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://192.168.18.35:4000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward request to backend signup endpoint
    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.errors || 'Registration failed' },
        { status: response.status }
      )
    }

    // Backend signup returns { statusCode, data: boolean, errors, message }
    // We need to sign in the user after successful registration
    if (data.data === true) {
      // Auto-signin after successful registration
      const signinResponse = await fetch(`${BACKEND_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
        }),
      })

      if (signinResponse.ok) {
        const signinData = await signinResponse.json()
        return NextResponse.json({
          data: {
            user: signinData.data.user,
            token: signinData.data.accessToken,
          },
        })
      }
    }

    // Fallback - registration successful but signin failed
    return NextResponse.json({
      message: 'Registration successful. Please sign in.',
    }, { status: 201 })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}