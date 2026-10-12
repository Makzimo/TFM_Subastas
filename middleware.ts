import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/api/sse",
  "/api/health",
  "/remates",
];

const roleRoutes: Record<string, string[]> = {
  ADMINISTRATIVO: ["/admin"],
  MARTILLERO: ["/martillero"],
  POSTOR: ["/postor"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // NextAuth v5 crea la sesión con AUTH_SECRET. Si se resolviera solo con
  // NEXTAUTH_SECRET y ambas difieren, getToken() no descifraría la cookie y
  // redirigiría a /login teniendo la sesión válida.
  //
  // secureCookie: en HTTPS (producción/Vercel) NextAuth guarda la cookie como
  // `__Secure-authjs.session-token`; si no se informa, getToken() busca
  // `authjs.session-token` y devuelve null → redirect a /login pese a sesión válida.
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string;

  for (const [role, prefixes] of Object.entries(roleRoutes)) {
    if (prefixes.some((p) => pathname.startsWith(p))) {
      if (userRole !== role) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
