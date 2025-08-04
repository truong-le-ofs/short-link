import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Validate token format (should have 3 parts separated by dots)
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      )
    }

    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        )
      }

      // Return user data from token payload
      return NextResponse.json({
        data: {
          id: payload.sub || payload.id,
          username: payload.username,
          email: payload.email,
          is_verified: payload.is_verified || false,
          created_at: payload.created_at,
          updated_at: payload.updated_at,
        },
      })
    } catch {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}