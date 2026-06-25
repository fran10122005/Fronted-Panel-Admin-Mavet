# Plan de Mejoras — Panel Administrativo MAVET

> Basado en el análisis del frontend (React 19 + TypeScript + Vite 6 + Tailwind v4) y backend (Express 5 + Sequelize + PostgreSQL).

---

## Fase 1: Calidad de Vida (Quick Wins) — 1-2 días

| #  | Mejora | Dónde | Impacto |
|----|--------|-------|---------|
| 1 | **Sistema de confirmación unificado** — Reemplazar `window.confirm()` por un modal reutilizable con diseño consistente. | RRHH, Biblioteca, Talleres, InventarioBóveda, Auditorio | ⭐⭐⭐ |
| 2 | **Unificar notificaciones** — Elegir entre `react-hot-toast` y `showAlert` manual (estado + timeout). Migrar todo al ganador. Elimina ~50 líneas de código repetido por página. | Todas las páginas | ⭐⭐⭐ |
| 3 | **Loading skeletons** — Reemplazar spinners genéricos por esqueletos que imiten la estructura de tablas/tarjetas mientras cargan. | Dashboard, Biblioteca, RRHH, Talleres, Recepción | ⭐⭐ |
| 4 | **Debounce en búsquedas** — Hook `useDebounce` para inputs de búsqueda. Evita re-renders/filtrados en cada tecleo. | RRHH (3 tabs), Biblioteca, Talleres, Recepción | ⭐⭐ |
| 5 | **Error Boundaries por página** — Envolver cada ruta lazy-load en un `ErrorBoundary`. Hoy un crash en una página puede tumbar todo el panel. | App.tsx (rutas lazy) | ⭐⭐⭐ |

### Detalle Técnico

**#1** — Modal de confirmación:
```tsx
// components/ui/ConfirmDialog.tsx
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}
```
Reemplazar usos de `window.confirm(...)` en ~15 lugares.

**#4** — Hook useDebounce:
```tsx
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

---

## Fase 2: Arquitectura Frontend — 2-3 días

| #  | Mejora | Dónde | Impacto |
|----|--------|-------|---------|
| 6 | **Refactor: separar componentes monolíticos** — Extraer tablas, formularios y filtros de los archivos de ~1000+ líneas en componentes independientes. | Biblioteca (1110), Talleres (1085), RRHH (920), Recepción, Ingresos | ⭐⭐⭐ |
| 7 | **Custom hooks por dominio** — Encapsular estado, fetch, paginación y CRUD en hooks como `useBiblioteca()`, `useRRHH()`. | Todas las páginas Mavet/ | ⭐⭐⭐ |
| 8 | **Validación de formularios con react-hook-form + Zod** — Reemplazar validación manual inconsistente por esquemas declarativos reutilizables. Coincide con el backend que ya usa Zod. | RRHH, Biblioteca, Talleres, Auditorio, Inventario | ⭐⭐ |
| 9 | **Hook `useApi<T>` genérico** — Estandarizar el patrón `loading / error / data` con tipado. Elimina try/catch repetitivo. | Todas las páginas | ⭐⭐⭐ |
| 10 | **Cancelación de peticiones** — AbortController en useEffect para evitar "setState on unmounted component" al navegar rápido. | Todas las páginas con fetch | ⭐⭐ |

### Detalle Técnico

**#6** — Estructura propuesta para Biblioteca (ejemplo):
```
src/pages/Mavet/biblioteca/
├── index.tsx                 # Página principal (~200 líneas)
├── LibrosTable.tsx           # Tabla con filtros
├── LibroFormModal.tsx        # Modal crear/editar
├── PrestamoPanel.tsx         # Control de préstamos por cédula
└── useBiblioteca.ts          # Hook con toda la lógica
```

**#9** — Hook useApi:
```tsx
function useApi<T>(
  fetcher: () => Promise<T>,
  deps: any[]
): { data: T | null; isLoading: boolean; error: string | null; refetch: () => void }
```

---

## Fase 3: Funcionalidades Pendientes — 2-3 días

| #  | Mejora | Dónde | Impacto |
|----|--------|-------|---------|
| 11 | **Paginación backend para usuarios** — `GET /api/auth/usuarios?page=&limit=`. Hoy devuelve todos sin paginar. | RRHH (tabla usuarios) | ⭐⭐ |
| 12 | **Paginación backend para eventos** — `GET /api/educacion/eventos?page=&limit=`. FullCalendar se beneficia de batches. | Auditorio | ⭐⭐ |
| 13 | **Paginación backend para inscripciones** — `GET /api/educacion/talleres/inscripciones?page=&limit=`. | Talleres | ⭐⭐ |
| 14 | **Dashboard con datos reales** — Revisar `getDashboardStats()` y que Home.tsx muestre métricas significativas (visitas hoy, obras totales, libros prestados, etc.). | Dashboard | ⭐⭐⭐ |
| 15 | **Botón de exportación en cada tabla** — Ya existe PDF service. Agregar export Excel/PDF en Biblioteca, RRHH (trabajadores, asistencias), Recepción, Inventario. | Múltiples páginas | ⭐⭐ |
| 16 | **Filtros combinados** — Agregar filtros por rango de fechas, estado, categoría además de la búsqueda textual actual. | Biblioteca, RRHH asistencias, Ingresos | ⭐⭐ |

---

## Fase 4: Backend — 2-3 días

| #  | Mejora | Dónde | Impacto |
|----|--------|-------|---------|
| 17 | **Paginación en endpoints faltantes** — `getAllUsuarios`, `getAllEventos`, `getAllInscripciones`, `getAllPrestamos`. Mismo patrón usado en obras/libros. | auth, educacion, biblioteca | ⭐⭐⭐ |
| 18 | **Validación Zod en todos los endpoints** — Muchos endpoints no validan entrada. Express v5 + Zod ya está en el proyecto. | Todos los controladores | ⭐⭐⭐ |
| 19 | **Migraciones Sequelize** — Reemplazar `sequelize.sync()` por migraciones con `umzug` o `sequelize-cli`. Control de cambios en esquema. | Base de datos | ⭐⭐⭐ |
| 20 | **Rate limiting específico por ruta** — Auth (login) debería tener límite más bajo (5 intentos/15min) que el global. | auth routes | ⭐⭐ |
| 21 | **Tests de integración** — Jest + supertest ya configurados. Agregar tests para nuevos endpoints y flujos críticos. | tests/integration/ | ⭐⭐⭐ |

---

## Fase 5: UX Avanzado — 2 días

| #  | Mejora | Dónde | Impacto |
|----|--------|-------|---------|
| 22 | **Atajos de teclado** — Ctrl+K búsqueda global, Escape cierra modales, Ctrl+Enter guarda formularios. | Global | ⭐⭐ |
| 23 | **Responsive mejorado** — Scroll horizontal en tablas mobile, sidebar colapsable por defecto en pantallas pequeñas. | Todas las tablas | ⭐⭐ |
| 24 | **Breadcrumbs dinámicos** — `PageBreadCrumb` existe pero no se usa en todas las páginas. Estandarizar. | AppLayout | ⭐ |
| 25 | **Tooltips en acciones** — Botones de editar/eliminar sin texto necesitan tooltip. Lucide-react tiene componente Tooltip. | Tablas (Biblioteca, RRHH, etc.) | ⭐ |
| 26 | **Empty states** — Tablas vacías deben mostrar ilustración/mensaje "No hay registros" en lugar de una tabla sin filas. | Todas las tablas | ⭐⭐ |

---

## Fase 6: DevOps y Mantenimiento — 1 día

| #  | Mejora | Dónde | Impacto |
|----|--------|-------|---------|
| 27 | **CI/CD con GitHub Actions** — Lint + typecheck + build + tests automáticos en cada PR. | GitHub | ⭐⭐⭐ |
| 28 | **Docker Compose** — Unificar frontend + backend + PostgreSQL en un solo comando (`docker compose up`). | Raíz del proyecto | ⭐⭐⭐ |
| 29 | **ESLint más estricto** — Reglas para imports ordenados, exports nomeclatura consistente, evitar any implícito. | Frontend + Backend | ⭐⭐ |
| 30 | **Documentación de componentes** — JSDoc/TSDoc en componentes reutilizables. Storybook opcional. | src/components/ | ⭐ |

---

## Prioridad Recomendada

```
Fase 1 ──► Fase 2 ──► Fase 3 ──► Fase 4 ──► Fase 5 ──► Fase 6
  (ahora)    (sprint 1)  (sprint 2)  (sprint 3)  (sprint 4)  (sprint 5)
```

### Resumen por sprint:

| Sprint | Items | Esfuerzo | Beneficio principal |
|--------|-------|----------|---------------------|
| **Quick Wins** | #1-#5 | 1-2 días | UX inmediato, menos bugs |
| **Arquitectura** | #6-#10 | 2-3 días | Código mantenible, escalable |
| **Features** | #11-#16 | 2-3 días | Cobertura funcional completa |
| **Backend** | #17-#21 | 2-3 días | Robustez, seguridad, tests |
| **UX** | #22-#26 | 2 días | Pulido visual final |
| **DevOps** | #27-#30 | 1 día | Automatización, documentación |

---

## Archivos Clave por Módulo

### Frontend (`Panel MAVET/`)
| Archivo | Tamaño | Problema principal |
|---------|--------|--------------------|
| `src/services/api.ts` | ~840 líneas | Monolítico, mezcla lógica de 8 dominios |
| `src/pages/Mavet/Biblioteca.tsx` | ~1110 líneas | Monolítico, mezcla UI + lógica |
| `src/pages/Mavet/Talleres.tsx` | ~1085 líneas | Monolítico, mezcla UI + lógica |
| `src/pages/Mavet/RRHH.tsx` | ~920 líneas | Monolítico, 3 tabs en un solo archivo |
| `src/types/index.ts` | ~172 líneas | Centralizado, OK pero podría modularizarse |

### Backend (`Backend MAVET/`)
| Archivo | Problema principal |
|---------|--------------------|
| `src/modules/auth/controllers/auth.controller.js` | Sin paginación en getAllUsuarios |
| `src/modules/educacion/controllers/...` | Sin paginación en getAllInscripciones, getAllEventos |
| `src/server.js` | `sequelize.sync()` + SQL migration scripts manuales |

---

*Documento generado el 25 de junio de 2026*
