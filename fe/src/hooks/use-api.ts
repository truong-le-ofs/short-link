"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-context"
import { type Link, type AnalyticsData, type CreateLinkData, type ApiResponse } from "@/types"
import { type UpdateLinkInput } from "@/lib/validations"

// Query Keys
export const queryKeys = {
  // Links
  links: ["links"] as const,
  link: (id: string) => ["links", id] as const,
  
  // Analytics
  analytics: ["analytics"] as const,
  analyticsFiltered: (filters: Record<string, unknown>) => ["analytics", filters] as const,
  
  // Auth
  user: ["user"] as const,
} as const

// Links Hooks
export function useLinks() {
  const { apiCall } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.links,
    queryFn: async () => {
      const response = await apiCall<ApiResponse<Link[]>>("/api/links")
      return response.data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useLink(id: string) {
  const { apiCall } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.link(id),
    queryFn: async () => {
      const response = await apiCall<ApiResponse<Link>>(`/api/links/${id}`)
      return response.data
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCreateLink() {
  const { apiCall } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateLinkData) => {
      const response = await apiCall<ApiResponse<Link>>("/api/links", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return response.data
    },
    onSuccess: (newLink) => {
      // Optimistic update - add new link to the cache
      queryClient.setQueryData<Link[]>(queryKeys.links, (old) => 
        old ? [newLink!, ...old] : [newLink!]
      )
      
      // Invalidate analytics to refresh stats
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics })
    },
  })
}

export function useUpdateLink() {
  const { apiCall } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLinkInput }) => {
      const response = await apiCall<ApiResponse<Link>>(`/api/links/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return response.data
    },
    onSuccess: (updatedLink, { id }) => {
      // Update link in links cache
      queryClient.setQueryData<Link[]>(queryKeys.links, (old) =>
        old ? old.map(link => link.id === id ? updatedLink! : link) : []
      )
      
      // Update individual link cache
      queryClient.setQueryData(queryKeys.link(id), updatedLink)
      
      // Invalidate analytics to refresh stats
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics })
    },
  })
}

export function useDeleteLink() {
  const { apiCall } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiCall(`/api/links/${id}`, {
        method: "DELETE",
      })
      return id
    },
    onSuccess: (deletedId) => {
      // Remove link from links cache
      queryClient.setQueryData<Link[]>(queryKeys.links, (old) =>
        old ? old.filter(link => link.id !== deletedId) : []
      )
      
      // Remove individual link cache
      queryClient.removeQueries({ queryKey: queryKeys.link(deletedId) })
      
      // Invalidate analytics to refresh stats
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics })
    },
  })
}

// Analytics Hooks
export function useAnalytics() {
  const { apiCall } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () => {
      const response = await apiCall<AnalyticsData>("/api/analytics")
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  })
}

// Custom code availability check
export function useCheckCustomCode() {
  const { apiCall } = useAuth()
  
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await apiCall<{ available: boolean }>(`/api/links/check/${code}`)
      return response
    },
  })
}

// Link resolution
export function useLinkResolution() {
  const { apiCall } = useAuth()
  
  return useMutation({
    mutationFn: async ({ code, password }: { code: string; password?: string }) => {
      const response = await apiCall<ApiResponse<{ url: string }>>(`/api/links/resolve/${code}`, {
        method: "POST",
        body: JSON.stringify({ password }),
      })
      return response.data
    },
  })
}

// Prefetch utilities
export function usePrefetchLink() {
  const { apiCall } = useAuth()
  const queryClient = useQueryClient()
  
  return (id: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.link(id),
      queryFn: async () => {
        const response = await apiCall<ApiResponse<Link>>(`/api/links/${id}`)
        return response.data
      },
      staleTime: 1 * 60 * 1000,
    })
  }
}

// Cache management utilities
export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  
  return {
    invalidateLinks: () => queryClient.invalidateQueries({ queryKey: queryKeys.links }),
    invalidateAnalytics: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics }),
    invalidateAll: () => queryClient.invalidateQueries(),
  }
}

// Offline/online handling
export function useOfflineStatus() {
  const queryClient = useQueryClient()
  
  return {
    setOffline: () => queryClient.getQueryCache().clear(),
    refetchOnReconnect: () => queryClient.refetchQueries({ stale: true }),
  }
}