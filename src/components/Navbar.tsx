"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATIVO: "Administrador",
  MARTILLERO: "Martillero",
  POSTOR: "Postor",
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  ADMINISTRATIVO: "bg-purple-600 text-purple-100",
  MARTILLERO: "bg-amber-600 text-amber-100",
  POSTOR: "bg-sky-600 text-sky-100",
};

const ROLE_NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  ADMINISTRATIVO: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/activos", label: "Lotes" },
    { href: "/admin/garantias", label: "Garantías" },
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/martilleros", label: "Martilleros" },
    { href: "/admin/audit", label: "Auditoría" },
  ],
  MARTILLERO: [
    { href: "/martillero/dashboard", label: "Dashboard" },
    { href: "/martillero/activos", label: "Mis Lotes" },
    { href: "/martillero/activos/nuevo", label: "Nuevo Lote" },
  ],
  POSTOR: [
    { href: "/postor/dashboard", label: "Dashboard" },
    { href: "/postor/garantia", label: "Garantía" },
  ],
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isLoggedIn = !!session?.user;
  const user = session?.user;
  const role = user?.role || "";
  const links = ROLE_NAV_LINKS[role] || [];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/remates" className="text-xl font-bold tracking-tight">
              Remates TFM
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/remates"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/remates" || pathname.startsWith("/remates/")
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Remates
              </Link>
              {isLoggedIn &&
                links.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-slate-700 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {isLoggedIn ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium leading-tight">
                    {user!.name || user!.email}
                  </p>
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_COLORS[role] || "bg-slate-600 text-slate-200"}`}
                  >
                    {ROLE_LABELS[role] || role}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/remates" })}
                  className="rounded-md border border-slate-500 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-white hover:text-white"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-md border border-slate-500 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-white hover:text-white"
                >
                  Crear Cuenta
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            role="button"
            tabIndex={0}
            className="rounded-md p-2 text-slate-300 hover:text-white md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            onTouchEnd={(e) => { e.preventDefault(); setMobileOpen((prev) => !prev); }}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/50 md:hidden"
            onClick={closeMobile}
            style={{ touchAction: "manipulation" }}
            aria-hidden="true"
          />
          <div className="fixed top-16 left-0 right-0 z-[110] border-t border-slate-700 bg-slate-900 shadow-xl md:hidden">
            <div className="space-y-1 px-4 pb-4 pt-2">
              <Link
                href="/remates"
                onClick={closeMobile}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === "/remates" || pathname.startsWith("/remates/")
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Remates
              </Link>
              {isLoggedIn &&
                links.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobile}
                      className={`block rounded-md px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-slate-700 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              <div className="border-t border-slate-700 pt-3">
                {isLoggedIn ? (
                  <>
                    <p className="px-3 text-sm font-medium">
                      {user!.name || user!.email}
                    </p>
                    <span
                      className={`ml-3 inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_COLORS[role] || "bg-slate-600 text-slate-200"}`}
                    >
                      {ROLE_LABELS[role] || role}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: "/remates" })}
                      className="mt-2 block w-full rounded-md border border-slate-500 px-3 py-2 text-left text-sm font-medium text-slate-300 hover:border-white hover:text-white"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMobile}
                      className="rounded-md border border-slate-500 px-3 py-2 text-sm font-medium text-slate-300 hover:border-white hover:text-white"
                    >
                      Crear Cuenta
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
