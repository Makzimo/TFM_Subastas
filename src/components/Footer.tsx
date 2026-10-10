import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
                R
              </div>
              <span className="text-lg font-bold text-white">Remates TFM</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Plataforma de remates de vehículos y especies de alto
              rendimiento. Transparente, segura y en tiempo real.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Plataforma</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/remates"
                  className="text-sm text-neutral-500 transition-colors hover:text-white"
                >
                  Remates activos
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-neutral-500 transition-colors hover:text-white"
                >
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-neutral-500 transition-colors hover:text-white"
                >
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Soporte</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-neutral-500">
                  Centro de ayuda
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-500">Contacto</span>
              </li>
              <li>
                <span className="text-sm text-neutral-500">
                  Preguntas frecuentes
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-neutral-500">
                  Términos de uso
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-500">
                  Política de privacidad
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-500">
                  Cookies
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-8 text-center">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} Remates TFM. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
