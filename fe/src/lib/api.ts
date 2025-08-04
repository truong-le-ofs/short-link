import { CreateLinkData, Link, ApiResponse, User, Schedule, Password } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.18.35:4000"
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
  // Use selective routing: local API proxy for shortlinks only, backend direct for auth and others
  const url = endpoint.startsWith('/shortlinks')
    ? `/api${endpoint}` 
    : `${API_BASE_URL}${endpoint}`

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

// Auth API functions
export const authApi = {
  // Sign in user
  signIn: async (email: string, password: string) => {
    return apiCall<{ user: User; accessToken: string }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  // Sign up user
  signUp: async (username: string, email: string, password: string) => {
    return apiCall<boolean>("/auth/signup", {
      method: "POST", 
      body: JSON.stringify({ username, email, password }),
    })
  },
}

// Shortlink API functions (updated to match backend)
export const linkApi = {
  // Create a new shortlink
  create: async (data: CreateLinkData): Promise<ApiResponse<Link>> => {
    return apiCall<ApiResponse<Link>>("/shortlinks", {
      method: "POST",
      body: JSON.stringify({
        default_url: data.url,
        short_code: data.customCode,
        expires_at: data.expiresAt,
        access_limit: data.accessLimit,
      }),
    })
  },

  // Get all shortlinks for the current user
  getAll: async (page = 1, limit = 10): Promise<ApiResponse<Link[]>> => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    })
    return apiCall<ApiResponse<Link[]>>(`/shortlinks?${params}`)
  },

  // Get a specific shortlink by ID
  getById: async (id: string): Promise<ApiResponse<Link>> => {
    return apiCall<ApiResponse<Link>>(`/shortlinks/${id}`)
  },

  // Update a shortlink
  update: async (id: string, data: Partial<CreateLinkData>): Promise<ApiResponse<Link>> => {
    return apiCall<ApiResponse<Link>>(`/shortlinks/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        default_url: data.url,
        is_active: data.isActive,
        expires_at: data.expiresAt,
        access_limit: data.accessLimit,
      }),
    })
  },

  // Delete a shortlink
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall<ApiResponse<void>>(`/shortlinks/${id}`, {
      method: "DELETE",
    })
  },

  // Access a shortlink (for resolution)
  access: async (shortCode: string, password?: string) => {
    return apiCall<{ target_url: string; password_required: boolean }>(`/shortlinks/s/${shortCode}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    })
  },

  // Direct redirect (GET method)
  redirect: async (shortCode: string) => {
    return apiCall<void>(`/shortlinks/s/${shortCode}`, {
      method: "GET",
    })
  },

  // Schedule management
  addSchedule: async (id: string, schedule: { target_url: string; start_time: string; end_time: string }) => {
    return apiCall<boolean>(`/shortlinks/${id}/schedules`, {
      method: "POST",
      body: JSON.stringify(schedule),
    })
  },

  getSchedules: async (id: string) => {
    return apiCall<Schedule[]>(`/shortlinks/${id}/schedules`)
  },

  updateSchedule: async (scheduleId: string, schedule: { target_url?: string; start_time?: string; end_time?: string }) => {
    return apiCall<boolean>(`/shortlinks/schedules/${scheduleId}`, {
      method: "PUT",
      body: JSON.stringify(schedule),
    })
  },

  deleteSchedule: async (scheduleId: string) => {
    return apiCall<boolean>(`/shortlinks/schedules/${scheduleId}`, {
      method: "DELETE",
    })
  },

  // Password protection
  addPassword: async (id: string, password: string, start_time?: string, end_time?: string) => {
    return apiCall<boolean>(`/shortlinks/${id}/passwords`, {
      method: "POST",
      body: JSON.stringify({ password, start_time, end_time }),
    })
  },

  getPasswords: async (id: string) => {
    return apiCall<Password[]>(`/shortlinks/${id}/passwords`)
  },

  removePassword: async (passwordId: string) => {
    return apiCall<boolean>(`/shortlinks/passwords/${passwordId}`, {
      method: "DELETE",
    })
  },
}