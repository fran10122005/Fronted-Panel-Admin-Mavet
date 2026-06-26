# MAVET Frontend — AGENTS.md

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server on port 3001 (`--host` exposes LAN) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint (flat config `eslint.config.js`, TS + TSX only) |
| `npm run preview` | Preview production build locally |

No test runner, no typecheck script, no formatter config.

## Architecture

- **React 19 + Vite 6 + TypeScript 5.7 + Tailwind CSS 4** (`@tailwindcss/postcss`)
- **Routing:** react-router v7 with `BrowserRouter`. Routes in `src/App.tsx`. Admins use `AppLayout` (sidebar + header). Public routes (`/asistencia`, `/registro-visitante`) are outside the layout.
- **Auth:** JWT in `localStorage` under `token` + `user`. Axios interceptor auto-attaches `Authorization: Bearer`. 401 response clears storage and redirects to `/signin`. Context in `src/context/AuthContext.tsx`.
- **API client:** `src/services/api.ts` — single file with all endpoints, exported as `mavetApi`. Base URL from `VITE_API_URL` env var, default `http://localhost:4000`.
- **PDF generation:** `src/services/pdf.service.ts` (jsPDF + jspdf-autotable).
- **Theme:** Dark mode via `.dark` class on `<html>`. Context in `src/context/ThemeContext.tsx`.
- **Sidebar:** Collapsible. Context in `src/context/SidebarContext.tsx`.

## Key conventions

- `src/types/index.ts` holds all TypeScript interfaces.
- `@typescript-eslint/no-explicit-any` is **off** — using `any` is fine.
- `react-refresh/only-export-components` is **warn**, not error.
- Tailwind v4 custom theme in `src/index.css` under `@theme {}`. Brand colors: `brand-*` (maroon base `#800000`). Custom breakpoints: `2xsm` (375px), `xsm` (425px), `3xl` (2000px). Default breakpoints reset.
- SVG icons in `src/icons/` imported as React components via `vite-plugin-svgr`. Use `import { ReactComponent as IconName } from "./path.svg"`.
- Font: "Playfair Display" (the `--font-outfit` var is misleading — it maps to Playfair Display; see `src/index.css`).
- Toasts: react-hot-toast, configured globally in `App.tsx`.
- All page components are lazy-loaded with `React.lazy()` + `Suspense`.
- `ErrorBoundary` wraps every route's page component.

## Backend

- Production: `https://backend-panel-admin-mavet.onrender.com` (set via Netlify env).
- Dev default: `http://localhost:4000`.
- Override via `.env` file: `VITE_API_URL=http://localhost:3000`.
- Backend API docs in `docs/API.md`. Notable: `/api/auth/me/foto` (POST) is **not implemented** — uploading profile photos will get a 404 until the backend adds it.

## Known gotchas

- The `foto_url` returned by `GET /api/auth/me` may point to `backend-panel-admin-mavet.onrender.com/api/auth/me/foto` even when no image is uploaded, causing a 404 in the console. The `<img>` in `UserMetaCard.tsx` handles this with `onError` → fallback initial.
- `profile?.Trabajador?.foto_url` is the actual image URL after upload (the `profile.foto_url` may be stale/incorrect).
- `GET /api/reportes/obras`, `/asistencia`, `/carta-aval/:cedula`, `/eventos` return **PDF binary** directly (not JSON).
- TypeScript strict mode is on (`noUnusedLocals`, `noUnusedParameters`). Unused imports/vars will fail the build.
- If adding a new page: add the lazy import in `App.tsx`, add the route inside the `<AuthRoute>` block for admin routes, and add the sidebar link in `AppSidebar.tsx`.
