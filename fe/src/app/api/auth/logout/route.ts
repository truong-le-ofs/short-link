import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Since there's no backend logout endpoint, we just return success
    // The frontend will handle clearing the token from localStorage
    return NextResponse.json({ 
      message: 'Logout successful' 
    })
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}