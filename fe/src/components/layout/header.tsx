"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MainNav } from "./main-nav"
import { UserNav } from "./user-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { Link as LinkIcon } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  
  // Don't show header on auth pages
  if (pathname?.includes('/login') || pathname?.includes('/register')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <LinkIcon className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              URL Shortener
            </span>
          </Link>
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="md:hidden">
              <Link className="flex items-center space-x-2" href="/">
                <LinkIcon className="h-6 w-6" />
                <span className="font-bold">URL Shortener</span>
              </Link>
            </div>
          </div>
          <nav className="flex items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}