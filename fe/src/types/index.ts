// Core types for URL Shortener application

export interface User {
  id: string
  username: string
  email: string
  is_verified: boolean
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
  default_url: string
  short_code: string
  is_active: boolean
  expires_at?: string
  access_limit?: number
  created_at: string
  updated_at: string
  schedules?: Schedule[]
  passwords?: Password[]
}

export interface Schedule {
  id: string
  target_url: string
  start_time: string
  end_time: string
  shortlink_id: string
  created_at: string
  updated_at: string
}

export interface Password {
  id: string
  start_time?: string
  end_time?: string
  shortlink_id: string
  created_at: string
  updated_at: string
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
  url: string
  customCode?: string
  expiresAt?: string
  accessLimit?: number
  isActive?: boolean
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
  username: string
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