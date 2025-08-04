// Core types for URL Shortener application

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface MetaTagData {
  title?: string
  description?: string
  image?: string
  site_name?: string
  type?: string
  url?: string
  // Twitter Card specific
  twitter_card?: string
  twitter_site?: string
  twitter_creator?: string
  twitter_image?: string
  twitter_title?: string
  twitter_description?: string
  // Additional meta info
  favicon?: string
  extracted_at?: string
  extraction_status?: 'pending' | 'success' | 'failed' | 'timeout'
}

export interface Link {
  id: string
  user_id: string
  original_url: string
  short_code: string
  title?: string
  description?: string
  password?: string
  expires_at?: string
  max_clicks?: number
  is_active: boolean
  created_at: string
  updated_at: string
  click_count: number
  meta_data?: MetaTagData
}

export interface LinkClick {
  id: string
  link_id: string
  ip_address?: string
  user_agent?: string
  referer?: string
  country?: string
  city?: string
  device_type?: string
  browser?: string
  os?: string
  created_at: string
}

export interface AnalyticsData {
  total_clicks: number
  unique_visitors: number
  clicks_today: number
  clicks_this_week: number
  clicks_this_month: number
  top_countries: Array<{
    country: string
    count: number
  }>
  top_devices: Array<{
    device: string
    count: number
  }>
  daily_clicks: Array<{
    date: string
    clicks: number
  }>
}

export interface CreateLinkData {
  original_url: string
  short_code?: string
  title?: string
  description?: string
  password?: string
  expires_at?: string
  max_clicks?: number
}

export interface LinkFormData extends CreateLinkData {
  // Form-specific fields
  confirmPassword?: string
}

// API types for database operations
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

export interface CreateUserData {
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UserSession {
  user: User | null
  isLoading: boolean
  error?: string
}