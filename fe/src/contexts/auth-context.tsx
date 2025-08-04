"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, LoginData, CreateUserData, ApiResponse } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>
  register: (data: CreateUserData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
  apiCall: <T>(endpoint: string, options?: RequestInit) => Promise<T>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_TOKEN_KEY = "url_shortener_token"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const { toast } = useToast()

  // Get stored token
  const getToken = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }

  // Set token
  const setToken = (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }

  // Remove token
  const removeToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }

  // API call helper
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

  // Load user from token
  const loadUser = async () => {
    const token = getToken()
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      const response = await apiCall<ApiResponse<User>>("/api/auth/me")
      if (response.data) {
        setState(prev => ({
          ...prev,
          user: response.data!,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }))
      }
    } catch (error) {
      console.error("Failed to load user:", error)
      removeToken()
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load user",
      }))
    }
  }

  // Login function
  const login = async (data: LoginData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await apiCall<ApiResponse<{ user: User; token: string }>>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      )

      if (response.data) {
        setToken(response.data.token)
        setState(prev => ({
          ...prev,
          user: response.data!.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }))
        toast.success("Login successful", "Welcome back!")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error("Login failed", errorMessage)
      throw error
    }
  }

  // Register function
  const register = async (data: CreateUserData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await apiCall<ApiResponse<{ user: User; token: string }>>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      )

      if (response.data) {
        setToken(response.data.token)
        setState(prev => ({
          ...prev,
          user: response.data!.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }))
        toast.success("Registration successful", "Welcome to URL Shortener!")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error("Registration failed", errorMessage)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Call logout endpoint to invalidate token on server
      await apiCall("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout API call failed:", error)
      // Continue with local logout even if API call fails
    }

    removeToken()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    toast.success("Logged out", "See you next time!")
  }

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  // Refresh user data
  const refreshUser = async () => {
    if (state.isAuthenticated) {
      await loadUser()
    }
  }

  // Load user on mount
  useEffect(() => {
    loadUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Token validation on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (state.isAuthenticated) {
        refreshUser()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [state.isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    apiCall,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}