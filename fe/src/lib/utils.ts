import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from 'nanoid'
import { SHORT_CODE_LENGTH, SHORT_CODE_CHARSET, URL_REGEX } from './constants'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return URL_REGEX.test(url)
  } catch {
    return false
  }
}

// Ensure URL has protocol
export function ensureProtocol(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

// Generate short code
export function generateShortCode(): string {
  return nanoid(SHORT_CODE_LENGTH)
}

// Generate custom short code with charset
export function generateCustomShortCode(length: number = SHORT_CODE_LENGTH): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += SHORT_CODE_CHARSET.charAt(Math.floor(Math.random() * SHORT_CODE_CHARSET.length))
  }
  return result
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return formatDate(date)
  }
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  }
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Get domain from URL
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(ensureProtocol(url))
    return urlObj.hostname
  } catch {
    return url
  }
}

// Validate custom short code
export function isValidShortCode(code: string): boolean {
  const regex = /^[a-zA-Z0-9-_]{3,20}$/
  return regex.test(code)
}

// Check if a link has expired
export function isLinkExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

// Check if a link has reached its max clicks
export function hasReachedMaxClicks(clickCount: number, maxClicks: number | null): boolean {
  if (!maxClicks) return false
  return clickCount >= maxClicks
}

// Get percentage of clicks used
export function getClickPercentage(clickCount: number, maxClicks: number | null): number {
  if (!maxClicks) return 0
  return Math.min((clickCount / maxClicks) * 100, 100)
}

// Get device type from user agent
export function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('mobile')) return 'Mobile'
  if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet'
  return 'Desktop'
}

// Get browser from user agent
export function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('chrome')) return 'Chrome'
  if (ua.includes('firefox')) return 'Firefox'
  if (ua.includes('safari')) return 'Safari'
  if (ua.includes('edge')) return 'Edge'
  if (ua.includes('opera')) return 'Opera'
  
  return 'Other'
}

// Get OS from user agent
export function getOS(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('windows')) return 'Windows'
  if (ua.includes('mac')) return 'macOS'
  if (ua.includes('linux')) return 'Linux'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('ios')) return 'iOS'
  
  return 'Other'
}

// Debounce function for search inputs
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}