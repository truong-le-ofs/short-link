"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl'

interface NavItem {
  titleKey: string
  href: string
}

const navItems: NavItem[] = [
  {
    titleKey: "dashboard",
    href: "/dashboard",
  },
  {
    titleKey: "links",
    href: "/links",
  },
  {
    titleKey: "analytics",
    href: "/analytics",
  },
]

export function MainNav() {
  const pathname = usePathname()
  const t = useTranslations('navigation')

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === item.href ? "text-foreground" : "text-foreground/60"
          )}
        >
          {t(item.titleKey)}
        </Link>
      ))}
    </nav>
  )
}