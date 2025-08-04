// Application constants

export const APP_NAME = 'URL Shortener'
export const APP_DESCRIPTION = 'A modern URL shortener with analytics and user management'

// URL validation regex
export const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

// Short code generation
export const SHORT_CODE_LENGTH = 6
export const SHORT_CODE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// Rate limiting
export const RATE_LIMIT_MAX_REQUESTS = 100
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// Link limits
export const MAX_LINKS_PER_USER = 1000
export const MAX_CUSTOM_CODE_LENGTH = 20
export const MIN_CUSTOM_CODE_LENGTH = 3

// Analytics
export const ANALYTICS_RETENTION_DAYS = 365
export const MAX_ANALYTICS_DAYS = 90

// Theme
export const THEME_STORAGE_KEY = 'url-shortener-theme'

// Navigation
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
  },
  {
    title: 'Links',
    href: '/links',
    icon: 'links',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: 'analytics',
  },
] as const