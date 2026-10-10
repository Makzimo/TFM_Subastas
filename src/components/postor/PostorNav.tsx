"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const postorLinks = [
  { href: "/remates", label: "Remates", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { href: "/postor/dashboard", label: "Mis Pujas", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/postor/garantia", label: "Garantía", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
]

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return "U"
}

function PostorNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16">
        {postorLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-4 py-2 min-w-[64px] transition-colors duration-200",
                isActive ? "text-orange-500" : "text-neutral-500"
              )}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isActive ? 2 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              <span className={cn("text-[11px] leading-tight", isActive && "font-semibold")}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

interface PostorDesktopNavProps {
  className?: string
}

function PostorDesktopNav({ className }: PostorDesktopNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const initials = getInitials(user?.name, user?.email)

  return (
    <header className={cn("sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-neutral-800", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <Link href="/remates" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-sm font-bold text-white">
                R
              </div>
              <span className="text-base font-bold text-white tracking-tight">Remates TFM</span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5 h-full">
              {postorLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg",
                      isActive
                        ? "text-white bg-white/10"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-500 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold text-white">
                    {initials}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white leading-tight">
                      {user.name || user.email}
                    </p>
                    <span className="text-xs text-neutral-500">Postor</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-neutral-700" />
                <button
                  onClick={() => signOut({ callbackUrl: "/remates" })}
                  className="px-3 py-1.5 text-sm font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors duration-200"
                >
                  Salir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export { PostorNav, PostorDesktopNav }
