"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const martilleroLinks = [
  { href: "/martillero/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/martillero/activos", label: "Mis Lotes", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { href: "/martillero/activos/nuevo", label: "Nuevo Lote", icon: "M12 4v16m8-8H4" },
]

interface MartilleroSidebarProps {
  collapsed?: boolean
}

function MartilleroSidebar({ collapsed = false }: MartilleroSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-neutral-950 text-white transition-all duration-300 border-r border-neutral-800",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-neutral-800">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-sm font-bold">
          M
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">Panel Martillero</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {martilleroLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-500/10 text-orange-500"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <svg
                className={cn("w-5 h-5 shrink-0", isActive ? "text-orange-500" : "text-neutral-500")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-800">
        <Link
          href="/remates"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 shrink-0 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {!collapsed && <span>Volver al sitio</span>}
        </Link>
      </div>
    </aside>
  )
}

export { MartilleroSidebar }
