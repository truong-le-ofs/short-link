import { CreateLinkData, Link, ApiResponse } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
const AUTH_TOKEN_KEY = "url_shortener_token"

// Get stored token
const getToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

// Generic API call helper
const apiCall = async <T,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken()
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || "An error occurred")
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Network error occurred")
  }
}

// Link API functions
export const linkApi = {
  // Create a new link
  create: async (data: CreateLinkData): Promise<ApiResponse<Link>> => {
    return apiCall<ApiResponse<Link>>("/api/links", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Get all links for the current user
  getAll: async (): Promise<ApiResponse<Link[]>> => {
    return apiCall<ApiResponse<Link[]>>("/api/links")
  },

  // Get a specific link by ID
  getById: async (id: string): Promise<ApiResponse<Link>> => {
    return apiCall<ApiResponse<Link>>(`/api/links/${id}`)
  },

  // Update a link
  update: async (id: string, data: Partial<CreateLinkData>): Promise<ApiResponse<Link>> => {
    return apiCall<ApiResponse<Link>>(`/api/links/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // Delete a link
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall<ApiResponse<void>>(`/api/links/${id}`, {
      method: "DELETE",
    })
  },

  // Check if a custom short code is available
  checkAvailability: async (shortCode: string): Promise<ApiResponse<{ available: boolean }>> => {
    return apiCall<ApiResponse<{ available: boolean }>>(`/api/links/check/${shortCode}`)
  },

  // Get link statistics
  getStats: async (id: string): Promise<ApiResponse<{ clicks: number; uniqueVisitors: number }>> => {
    return apiCall<ApiResponse<{ clicks: number; uniqueVisitors: number }>>(`/api/links/${id}/stats`)
  },
}