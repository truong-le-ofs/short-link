"use client"

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start timing an operation
  start(operation: string): void {
    this.metrics.set(operation, performance.now())
  }

  // End timing and log the result
  end(operation: string): number {
    const startTime = this.metrics.get(operation)
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.metrics.delete(operation)

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  // Measure a function execution time
  async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.start(operation)
    try {
      const result = await fn()
      this.end(operation)
      return result
    } catch (error) {
      this.end(operation)
      throw error
    }
  }

  // Measure React component render time
  measureRender(componentName: string, renderFn: () => void): void {
    if (typeof window === 'undefined') return

    this.start(`render:${componentName}`)
    renderFn()
    // Use setTimeout to measure after render
    setTimeout(() => {
      this.end(`render:${componentName}`)
    }, 0)
  }

  // Get Core Web Vitals
  getCoreWebVitals(): Promise<{
    fcp?: number
    lcp?: number
    fid?: number
    cls?: number
    ttfb?: number
  }> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({})
        return
      }

      const vitals: Record<string, number> = {}

      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime
          }
        }
      }).observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        vitals.lcp = lastEntry.startTime
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEventTiming[]) {
          vitals.fid = entry.processingStart - entry.startTime
        }
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        vitals.cls = clsValue
      }).observe({ entryTypes: ['layout-shift'] })

      // Time to First Byte
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceNavigationTiming[]) {
          vitals.ttfb = entry.responseStart - entry.requestStart
        }
      }).observe({ entryTypes: ['navigation'] })

      // Return vitals after a delay to collect data
      setTimeout(() => resolve(vitals), 3000)
    })
  }
}

// Global performance monitor instance
export const perfMonitor = PerformanceMonitor.getInstance()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    start: (operation: string) => perfMonitor.start(operation),
    end: (operation: string) => perfMonitor.end(operation),
    measure: <T>(operation: string, fn: () => Promise<T>) => perfMonitor.measure(operation, fn),
    measureRender: (componentName: string, renderFn: () => void) => 
      perfMonitor.measureRender(componentName, renderFn),
  }
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return

  // Estimate bundle size from script tags
  const scripts = document.querySelectorAll('script[src]')
  let totalSize = 0

  scripts.forEach(async (script) => {
    const src = (script as HTMLScriptElement).src
    if (src.includes('/_next/')) {
      try {
        const response = await fetch(src, { method: 'HEAD' })
        const size = parseInt(response.headers.get('content-length') || '0')
        totalSize += size
        console.log(`Script: ${src.split('/').pop()} - ${(size / 1024).toFixed(2)}KB`)
      } catch {
        console.warn('Could not fetch script size:', src)
      }
    }
  })

  setTimeout(() => {
    console.log(`Estimated total bundle size: ${(totalSize / 1024).toFixed(2)}KB`)
  }, 1000)
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
  
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2),
  }
}

// Image optimization utilities
export function optimizeImageLoading() {
  // Lazy load images using Intersection Observer
  if (typeof window === 'undefined') return

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      }
    })
  })

  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img)
  })
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  const fontPreloads = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-var-italic.woff2',
  ]

  fontPreloads.forEach((font) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Preload critical API endpoints
  const apiPreloads = ['/api/links', '/api/analytics']
  
  apiPreloads.forEach((endpoint) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = endpoint
    document.head.appendChild(link)
  })
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Monitor Core Web Vitals
  perfMonitor.getCoreWebVitals().then((vitals) => {
    console.log('Core Web Vitals:', vitals)
  })

  // Analyze bundle size in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(analyzeBundleSize, 2000)
  }

  // Monitor memory usage periodically
  setInterval(() => {
    const memory = monitorMemoryUsage()
    if (memory && parseFloat(memory.usagePercentage) > 80) {
      console.warn('High memory usage detected:', memory)
    }
  }, 30000) // Check every 30 seconds

  // Optimize image loading
  optimizeImageLoading()

  // Preload critical resources
  preloadCriticalResources()
}