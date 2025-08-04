import { NextRequest, NextResponse } from "next/server"
import { ZodSchema } from "zod"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Common response type
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

// Enhanced error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // per window

// Rate limiting middleware
export function rateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(ip)

  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  userLimit.count++
  return true
}

// Auth middleware
export function requireAuth(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader
}

// Validation middleware
export function validateBody<T>(body: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new ApiError(400, "Validation failed", result.error.issues)
  }
  return result.data
}

// Request logger middleware
export function logRequest(request: NextRequest, startTime?: number) {
  const duration = startTime ? Date.now() - startTime : 0
  console.log(`[API] ${request.method} ${request.url} - ${duration}ms`)
}

// Enhanced fetch with error handling
export async function apiForward(
  endpoint: string,
  options: RequestInit = {},
  authHeader?: string
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader && { Authorization: authHeader }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    // Log the request for debugging
    console.log(`[Forward] ${config.method || 'GET'} ${endpoint} - ${response.status}`)
    
    return response
  } catch (error) {
    console.error(`[Forward Error] ${config.method || 'GET'} ${endpoint}:`, error)
    throw new ApiError(500, "Backend service unavailable")
  }
}

// API route wrapper with middleware
export function withMiddleware(
  handler: (request: NextRequest, context: { authHeader?: string }) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    rateLimit?: boolean
    validateBody?: ZodSchema
    logRequests?: boolean
  } = {}
) {
  return async (request: NextRequest, context?: { params?: Record<string, string> }): Promise<NextResponse> => {
    const startTime = Date.now()
    
    try {
      // Rate limiting
      if (options.rateLimit) {
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
        if (!rateLimit(ip)) {
          return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
          )
        }
      }

      // Authentication
      let authHeader: string | undefined
      if (options.requireAuth) {
        authHeader = requireAuth(request) || undefined
        if (!authHeader) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          )
        }
      }

      // Body validation
      if (options.validateBody && request.body) {
        try {
          const body = await request.json()
          const validatedBody = validateBody(body, options.validateBody)
          // Replace the request body with validated data
          ;(request as NextRequest & { _validatedBody: unknown })._validatedBody = validatedBody
        } catch (error) {
          if (error instanceof ApiError) {
            return NextResponse.json(
              { error: error.message, details: error.details },
              { status: error.status }
            )
          }
          throw error
        }
      }

      // Execute handler
      const response = await handler(request, { authHeader, ...(context || {}) })

      // Request logging
      if (options.logRequests) {
        logRequest(request, startTime)
      }

      return response

    } catch (error) {
      console.error("API Error:", error)
      
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status }
        )
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

// Standardized success response
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data,
  }, { status })
}

// Standardized error response
export function errorResponse(message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    ...(details ? { details } : {})
  }, { status })
}

// Utility to extract validated body from request
export function getValidatedBody<T>(request: NextRequest): T {
  return (request as NextRequest & { _validatedBody: T })._validatedBody
}