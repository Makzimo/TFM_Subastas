"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATIVO: "Administrador",
  MARTILLERO: "Martillero",
  POSTOR: "Postor",
};

/* ── Estructura de menú tipo Consensys ── */
interface NavChild {
  label: string;
  href: string;
  desc?: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
}

function buildNavItems(role: string): NavItem[] {
  const base: NavItem[] = [
    {
      label: "Remates",
      children: [
        { label: "Remates activos", href: "/remates", desc: "Vehículos y especies disponibles" },
        { label: "Cómo funciona", href: "/#como-funciona", desc: "Tres pasos para adjudicarte" },
      ],
    },
  ];

  if (role === "ADMINISTRATIVO") {
    base.push({
      label: "Plataforma",
      children: [
        { label: "Dashboard", href: "/admin/dashboard", desc: "Vista general del sistema" },
        { label: "Lotes", href: "/admin/activos", desc: "Gestionar activos" },
        { label: "Usuarios", href: "/admin/usuarios", desc: "Administrar usuarios" },
        { label: "Martilleros", href: "/admin/martilleros", desc: "Gestionar martilleros" },
        { label: "Garantías", href: "/admin/garantias", desc: "Solicitudes de garantía" },
        { label: "Auditoría", href: "/admin/audit", desc: "Registro de actividad" },
      ],
    });
  } else if (role === "MARTILLERO") {
    base.push({
      label: "Plataforma",
      children: [
        { label: "Dashboard", href: "/martillero/dashboard", desc: "Vista general" },
        { label: "Mis Lotes", href: "/martillero/activos", desc: "Lotes asignados" },
        { label: "Nuevo Lote", href: "/martillero/activos/nuevo", desc: "Crear un nuevo lote" },
      ],
    });
  } else if (role === "POSTOR") {
    base.push({
      label: "Plataforma",
      children: [
        { label: "Dashboard", href: "/postor/dashboard", desc: "Mis pujas y actividad" },
        { label: "Garantía", href: "/postor/garantia", desc: "Gestionar garantías" },
      ],
    });
  }

  return base;
}

/* ── Iconos SVG ── */
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-3 w-3"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

/* ── Hamburger Lines ── */
function HamburgerLines({ open }: { open: boolean }) {
  return (
    <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
      <span
        className={`block h-[2px] w-5 bg-white transition-all duration-300 ${
          open ? "translate-y-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-[2px] w-5 bg-white transition-all duration-300 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-[2px] w-5 bg-white transition-all duration-300 ${
          open ? "-translate-y-[7px] -rotate-45" : ""
        }`}
      />
    </div>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
    setOpenDropdown(null);
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isLoggedIn = !!session?.user;
  const user = session?.user;
  const role = user?.role || "";
  const navItems = buildNavItems(role);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  return (
    <>
      {/* ── Header principal ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-12">

          {/* ── Left: Pill container (logo + nav) estilo Consensys ── */}
          <div className="flex items-center rounded-full border border-white/10 p-1 gap-1">
            {/* Logo — 48x48 circular */}
            <Link href="/remates" className="flex items-center shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-black">
                R
              </div>
            </Link>

            {/* Desktop nav links — pill-shaped buttons */}
            <nav className="hidden items-center gap-0.5 lg:flex">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  {item.children ? (
                    <>
                      <button
                        className={`group flex items-center gap-1 rounded-full px-5 h-11 text-sm tracking-[0.28px] transition-colors duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          openDropdown === item.label
                            ? "text-white"
                            : "text-white/80 hover:text-white"
                        }`}
                        aria-expanded={openDropdown === item.label}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform duration-200 ${
                            openDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown panel */}
                      {openDropdown === item.label && (
                        <div
                          className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#1d1d1d] shadow-2xl py-2"
                          onMouseEnter={() => handleDropdownEnter(item.label)}
                          onMouseLeave={handleDropdownLeave}
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                                  {child.label}
                                </span>
                                {child.desc && (
                                  <span className="text-xs text-white/40">{child.desc}</span>
                                )}
                              </div>
                              <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-orange-400 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href ?? "#"}
                      className={`flex items-center rounded-full px-5 h-11 text-sm tracking-[0.28px] transition-colors duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        pathname === item.href
                          ? "text-white"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* ── Right: Search + Auth CTA estilo Consensys ── */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Search */}
            <button
              className="flex h-12 w-12 items-center justify-center rounded-full text-white/60 transition-colors duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white hover:bg-white/5"
              aria-label="Buscar"
            >
              <SearchIcon className="h-4 w-4" />
            </button>

            {isLoggedIn ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-2 mr-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1d] text-xs font-medium text-white">
                    {user!.name
                      ? user!.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : user!.email?.slice(0, 2).toUpperCase() || "U"}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-xs font-medium text-white leading-tight">{user!.name || user!.email}</p>
                    <span className="text-[10px] text-white/40">{ROLE_LABELS[role] || role}</span>
                  </div>
                </div>

                {/* Logout CTA — pill con icono circular estilo Consensys */}
                <button
                  onClick={() => signOut({ callbackUrl: "/remates" })}
                  className="group flex items-center gap-1 rounded-full bg-[#1d1d1d] p-1 pl-5 h-14 text-sm tracking-[0.28px] text-white transition-all duration-[400ms] ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:bg-[#2a2a2a]"
                >
                  <span>Salir</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#121212] transition-all duration-[400ms] ease-[cubic-bezier(0.455,0.03,0.515,0.955)] group-hover:bg-orange-500">
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </button>
              </>
            ) : (
              <>
                {/* Login CTA — pill con icono circular estilo Consensys */}
                <Link
                  href="/login"
                  className="group flex items-center gap-1 rounded-full bg-[#1d1d1d] p-1 pl-5 h-14 text-sm tracking-[0.28px] text-white transition-all duration-[400ms] ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:bg-[#2a2a2a]"
                >
                  <span>Log in</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#121212] transition-all duration-[400ms] ease-[cubic-bezier(0.455,0.03,0.515,0.955)] group-hover:bg-orange-500">
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <HamburgerLines open={mobileOpen} />
          </button>
        </div>
      </header>

      {/* ── Mobile menu — fullscreen overlay ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
          />
          <div className="fixed top-14 left-0 right-0 bottom-0 z-[110] bg-black lg:hidden overflow-y-auto">
            <div className="px-6 py-6 space-y-2">
              {/* Nav items */}
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                        className="flex w-full items-center justify-between rounded-full px-5 h-12 text-sm tracking-[0.28px] text-white/80 hover:bg-white/5 hover:text-white transition-colors duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-white/40 transition-transform duration-200 ${
                            openDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openDropdown === item.label && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-4">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMobile}
                              className="group flex items-center justify-between rounded-full px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <span>{child.label}</span>
                              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href ?? "#"}
                      onClick={closeMobile}
                      className="flex items-center rounded-full px-5 h-12 text-sm tracking-[0.28px] text-white/80 hover:bg-white/5 hover:text-white transition-colors duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-white/10 my-4" />

              {/* Auth section */}
              {isLoggedIn ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d1d1d] text-sm font-medium text-white">
                      {user!.name
                        ? user!.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                        : user!.email?.slice(0, 2).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user!.name || user!.email}</p>
                      <span className="text-xs text-white/40">{ROLE_LABELS[role] || role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/remates" })}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1d] px-5 py-3 text-sm tracking-[0.28px] text-white hover:bg-[#2a2a2a] transition-colors duration-[400ms] ease-[cubic-bezier(0.455,0.03,0.515,0.955)]"
                  >
                    <span>Cerrar sesión</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 px-4">
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1d] px-5 py-3 text-sm tracking-[0.28px] text-white hover:bg-[#2a2a2a] transition-colors duration-[400ms] ease-[cubic-bezier(0.455,0.03,0.515,0.955)]"
                  >
                    <span>Log in</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobile}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                  >
                    <span>Crear cuenta</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
