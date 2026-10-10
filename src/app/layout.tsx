import type { Metadata } from "next";
import Providers from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remates TFM - Plataforma de Remates",
  description:
    "Plataforma de remates de vehículos y especies de alto rendimiento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen antialiased">
        <Providers>
          <div id="app-root">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
