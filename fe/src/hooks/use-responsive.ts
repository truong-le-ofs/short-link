"use client"

import { useEffect, useState } from "react"

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl"

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`)
}

export function useBreakpoints() {
  const sm = useBreakpoint("sm")
  const md = useBreakpoint("md")
  const lg = useBreakpoint("lg")
  const xl = useBreakpoint("xl")
  const xxl = useBreakpoint("2xl")

  return { sm, md, lg, xl, "2xl": xxl }
}

export function useCurrentBreakpoint(): Breakpoint | "xs" {
  const breakpoints = useBreakpoints()

  if (breakpoints["2xl"]) return "2xl"
  if (breakpoints.xl) return "xl"
  if (breakpoints.lg) return "lg"
  if (breakpoints.md) return "md"
  if (breakpoints.sm) return "sm"
  return "xs"
}

export function useIsMobile(): boolean {
  return !useBreakpoint("md")
}

export function useIsDesktop(): boolean {
  return useBreakpoint("lg")
}