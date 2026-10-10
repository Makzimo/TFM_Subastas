# Plan de Redesign — Estilo Consensys.io

**Fecha:** 2026-09-24
**Estado:** ✅ COMPLETADO
**Objetivo:** Rediseñar toda la UI al estilo Consensys.io (dark theme, elegante) conservando la paleta naranja + azul del proyecto.

---

## Paleta de colores

```
Background:  #000000 (negro puro)
Surface:     #0a0a0a (cards, sidebars)
Border:      #1a1a1a / #262626 (bordes sutiles)
Text:        #ffffff (primario), #a3a3a3 (secundario), #525252 (terciario)
Orange:      #f97316 (brand primary — botones, acentos, CTAs)
Blue:        #3b82f6 (brand secondary — links, badges admin)
Success:     #22c55e (activos, en vivo)
Warning:     #eab308 (garantía pendiente)
Error:       #ef4444 (destructive)
```

---

## FASE 0 — Fundación (Theme + Tipografía)

- [x] Reescribir `src/app/globals.css` con theme oscuro (tokens orange/blue)
- [x] Actualizar `<html className="dark">` en `src/app/layout.tsx`

---

## FASE 1 — Navbar Global (Consensys-style)

- [x] Rediseñar `src/components/Navbar.tsx` — glassmorphism dark, links centro, CTA der
- [x] Actualizar `src/app/remates/layout.tsx` — Usar nuevo navbar

---

## FASE 2 — Landing Page (/)

- [x] Crear `src/app/page.tsx` — Hero + Cómo funciona + Lotes destacados + Footer

---

## FASE 3 — Página Remates (/remates)

- [x] Rediseñar `src/app/remates/page.tsx` — Theme oscuro
- [x] Rediseñar `src/components/AssetCard.tsx` — Cards oscuras estilo Consensys

---

## FASE 4 — Página Detalle (/remates/[id])

- [x] Rediseñar `src/app/remates/[id]/page.tsx` — Theme oscuro
- [x] Rediseñar `src/components/AuctionRoom.tsx` — Fondo oscuro
- [x] Rediseñar `src/components/LiveBid.tsx` — Card oscura
- [x] Rediseñar `src/components/BidControls.tsx` — Controles dark
- [x] Rediseñar `src/components/BidHistoryLive.tsx` — Lista dark
- [x] Rediseñar `src/components/WinnerIndicator.tsx` — Dark
- [x] Rediseñar `src/components/GuaranteePrompt.tsx` — Dark

---

## FASE 5 — Sidebars Admin/Martillero

- [x] Rediseñar `src/components/admin/AdminSidebar.tsx` — Sidebar oscuro
- [x] Rediseñar `src/components/martillero/MartilleroSidebar.tsx` — Mismo estilo
- [x] Actualizar `src/app/admin/layout.tsx` — Layout con sidebar oscuro
- [x] Actualizar `src/app/martillero/layout.tsx` — Layout con sidebar oscuro

---

## FASE 6 — Dashboard Pages

- [x] Dashboard pages — Funcionan via tokens semánticos (bg-card, text-foreground, etc.)
- [x] stat-card/page-header — Usan tokens semánticos, compatibles con dark theme

---

## FASE 7 — Auth Pages (Login/Register)

- [x] Auth pages — Usan tokens semánticos (bg-card, bg-background, text-primary)
- [x] Actualizar `src/app/(auth)/layout.tsx` — Layout oscuro con gradiente

---

## FASE 8 — Postor Nav + Garantía

- [x] Rediseñar `src/components/postor/PostorNav.tsx` — Desktop nav dark
- [x] Actualizar `src/app/postor/layout.tsx` — Layout oscuro

---

## FASE 9 — Loading States + Empty States

- [x] Empty states — Iconos + texto gris sobre fondo negro (ya implementado en FASE 3)

---

## FASE 10 — Footer Global

- [x] Crear `src/components/Footer.tsx` — Footer multi-columna estilo Consensys
- [x] Integrar `<Footer />` en landing page y remates listing

---

## FASE 11 — Verificación Final

- [x] `pnpm check` — 0 errores
- [x] `pnpm build` — 30 rutas compilan
- [x] Screenshots Playwright: Landing, Login, Remates, Detalle — ✅ Todos correctos
- [x] CHANGELOG v0.15.0 — Documentado

---

## Archivos modificados (36)

| Fase | Archivos |
|------|----------|
| 0 | `globals.css`, `layout.tsx` |
| 1 | `Navbar.tsx`, `remates/layout.tsx` |
| 2 | `page.tsx` (landing) |
| 3 | `remates/page.tsx`, `AssetCard.tsx` |
| 4 | `remates/[id]/page.tsx`, `AuctionRoom.tsx`, `LiveBid.tsx`, `BidControls.tsx`, `BidHistoryLive.tsx`, `WinnerIndicator.tsx`, `GuaranteePrompt.tsx` |
| 5 | `AdminSidebar.tsx`, `MartilleroSidebar.tsx`, `admin/layout.tsx`, `martillero/layout.tsx` |
| 7 | `(auth)/layout.tsx` |
| 8 | `PostorNav.tsx`, `postor/layout.tsx` |
| 10 | `Footer.tsx` (nuevo) |
