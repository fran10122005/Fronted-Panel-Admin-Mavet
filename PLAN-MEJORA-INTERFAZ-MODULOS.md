# Plan de Mejora Integral — Interfaz y Funcionalidades por Módulo

> **Proyecto:** Panel MAVET (Museo de Artes Visuales y del Espacio del Táchira)
> **Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4
> **Fecha:** Julio 2026

---

## Diagnóstico General

| Aspecto | Hallazgo |
|---|---|
| **Consistencia UI** | Estilos duplicados (`inputCls` en 5+ archivos), mezcla de patrones de tabs, estilos inline dispersos |
| **Tamaño de páginas** | Auditorio (1563), Inventario (1547), Talleres (1111), Biblioteca (735) — violan SRP |
| **Manejo de estado** | Lógica de negocio mezclada con JSX; `useState` disperso sin hook unificado en Auditorio, Inventario, Ingresos |
| **Accesibilidad** | Faltan roles ARIA, `aria-label`, navegación por teclado, foco visible, contraste |
| **Responsive** | Tablas sin scroll horizontal en mobile, modales no adaptativos |
| **Feedback visual** | `LoadingSkeleton` inconsistente, falta de estados vacíos, errores silenciosos en algunos catch |
| **Rendimiento** | `React.lazy` solo a nivel de página; falta memoización en listas grandes, renders innecesarios |
| **Código duplicado** | Input classes, headers de página, patrones de filtros/búsqueda se repiten en cada módulo |

---

## Plan de Implementación por Fases

### Fase 1 — Arquitectura Base (Semana 1-2)

#### 1.1 Sistema de Design Tokens y Componentes Compartidos

**Problema:** `inputCls`, `selectCls` y patrones de layout se repiten manualmente en cada página.

**Acciones:**
- [ ] Mover `inputCls` a utilidad Tailwind via `@utility` en `index.css`:
  ```css
  @utility input-mavet {
    @apply w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90;
  }
  ```
- [ ] Crear `InputMavet` (wrapper sobre `TextField`) y `SelectMavet` (wrapper sobre `Select`) con estilos pre-aplicados y soporte ARIA.
- [ ] Crear `PageHeader` como componente reutilizable:
  ```tsx
  <PageHeader title="..." subtitle="..." actions={[...]} />
  ```
- [ ] Estandarizar tabs con un componente `Tabs` genérico (reemplazar los 6 patrones de tabs inline actuales).
- [ ] Crear `FilterBar` (search + selects de filtro + sort) componente paramétrico.

**Archivos afectados:** `index.css`, nuevo `src/components/common/PageHeader.tsx`, `src/components/ui/InputMavet.tsx`, `src/components/ui/Tabs.tsx`, `src/components/ui/FilterBar.tsx`

#### 1.2 Sistema de Estados (Loading / Empty / Error)

**Problema:** Cada página maneja loading/error/empty de forma distinta.

**Acciones:**
- [ ] Crear wrapper `AsyncContent` que unifique:
  ```tsx
  <AsyncContent loading={isLoading} error={error} empty={!data.length} emptyMessage="...">
    {children}
  </AsyncContent>
  ```
- [ ] Estandarizar skeletos: `variant="table"`, `variant="card"`, `variant="form"`
- [ ] Agregar `ErrorFallback` con botón de reintento
- [ ] Agregar `EmptyState` con icono, mensaje y acción opcional (ej. "Crear primer registro")

**Archivos afectados:** Nuevo `src/components/ui/AsyncContent.tsx`, `src/components/ui/EmptyState.tsx`

---

### Fase 2 — Refactor de Módulos Críticos (Semana 3-5)

#### 2.1 RRHH (Gestión de Personal)

**Estado actual:** 320 líneas, hook `useRRHH` (494 líneas), lógica bien separada.

**Mejoras:**
- [ ] Extraer `TrabajadoresTable` y `UsuariosTable` como componentes independientes
- [ ] Agregar columna de acciones con dropdown (no botones sueltos)
- [ ] Agregar `aria-sort` en headers de tabla ordenable
- [ ] Feedback visual al inactivar usuario (confirm dialog con advertencia de "último admin")
- [ ] Tooltip en badges de rol
- [ ] Modo oscuro: verificar contraste de badges

#### 2.2 Biblioteca

**Estado actual:** 735 líneas, hook `useLibros`, tabs "Inventario" y "Consultas".

**Mejoras:**
- [ ] Extraer `InventarioTab` y `ConsultasTab` a archivos separados
- [ ] Tabla responsive con `overflow-x-auto` y sticky columns
- [ ] Agregar búsqueda por código ISBN
- [ ] Mostrar portada del libro como thumbnail en la tabla
- [ ] Filtro combinado (categoría + estado + autor + título)
- [ ] Vista rápida (modal) desde la tabla sin abrir detalle completo

#### 2.3 Inventario Bóveda (Obras de Arte)

**Estado actual:** 1547 líneas, sin hook, todo en el componente.

**Mejoras:**
- [ ] **URGENTE:** Extraer lógica a `useInventario` hook (estado + filtros + CRUD)
- [ ] Extraer `ObraForm`, `ObraTable`, `FiltrosObra` como componentes
- [ ] Galería de imágenes con zoom modal (usar Swiper ya disponible)
- [ ] Vista de grid/cards toggle (además de tabla)
- [ ] Filtro por clasificación patrimonial y ubicación
- [ ] Mejorar manejo de imágenes: preview antes de upload, drag & drop
- [ ] Subida múltiple de imágenes

#### 2.4 Talleres

**Estado actual:** 1111 líneas, hook `useTalleres`, tabs "Planificados", "Inscripciones", "Instructores".

**Mejoras:**
- [ ] Extraer cada tab a su propio componente
- [ ] Separar `useTalleresInstructores` del hook principal
- [ ] Calendario de sesiones con Swiper/carousel
- [ ] Reporte de asistencia por sesión descargable
- [ ] Notificaciones al instructor cuando se acerca la fecha
- [ ] Vista de timeline para talleres activos

#### 2.5 Auditorio (Reservas)

**Estado actual:** 1563 líneas, sin hook, estado disperso en `useState`.

**Mejoras:**
- [ ] **URGENTE:** Extraer lógica a `useAuditorio` hook
- [ ] Separar `EventForm`, `EventList`, `EventCalendar`, `EventDetail`
- [ ] Vista de conflicto de horarios (superposición visual en calendario)
- [ ] Flujo de aprobación: notificación toast + badge de estado con animación
- [ ] Búsqueda por código de reserva
- [ ] Exportar comprobante optimizado (pdf.service.js ya existe)
- [ ] Recordatorio automático 24h antes vía toast

#### 2.6 Recepción

**Estado actual:** 469 líneas, hook `useRecepcion`, flujo de check-in.

**Mejoras:**
- [ ] Agregar escáner QR inline (html5-qrcode ya disponible)
- [ ] Historial rápido del visitante en la misma vista al seleccionarlo
- [ ] Botón de "Registrar salida" rápida desde resultados de búsqueda
- [ ] Dashboard de ocupación en tiempo real
- [ ] Soporte para grupos/visitas institucionales con registro masivo
- [ ] Mejorar UX del consentimiento de datos (checkbox + resumen visible)

#### 2.7 Ingresos (Dashboard de Visitantes)

**Estado actual:** 143 líneas, muy simple, solo muestra stats básicos.

**Mejoras:**
- [ ] Agregar gráficos mensuales con Recharts (barras apiladas por tipo de visitante)
- [ ] Tabla de ingresos recientes con paginación
- [ ] Filtro por rango de fechas, tipo de visitante, motivo
- [ ] Exportar reporte mensual PDF
- [ ] KPI cards animadas con sparkline (como el Dashboard de Gerente)

#### 2.8 Asistencia Personal

**Estado actual:** 398 líneas, flujo PIN + facial.

**Mejoras:**
- [ ] Vista de tarjeta (card) para cada trabajador con foto y asistencia del día
- [ ] Timeline de marcaciones (entrada/salida/break)
- [ ] Gráfico semanal de horas trabajadas
- [ ] Alerta de retardo / falta injustificada
- [ ] Integración con notificaciones push (toast)

#### 2.9 Educación

**Estado actual:** Solo wrapper con tabs que incluye Talleres + Auditorio.

**Mejoras:**
- [ ] Dashboard educativo con KPIs (estudiantes activos, talleres del mes, etc.)
- [ ] Calendario académico unificado (talleres + eventos auditorio)
- [ ] Reportes de rendimiento por período
- [ ] Estadísticas de participación

---

### Fase 3 — UX/UI Transversal (Semana 6-7)

#### 3.1 Accesibilidad (A11Y)

- [ ] Agregar `aria-label` a todos los botones icon-only
- [ ] Roles `region`, `navigation`, `main`, `complementary` en layout
- [ ] Navegación por teclado: Tab order, Enter/Escape en modales, arrow keys en tablas
- [ ] Focus trap en modales (verificar que `Modal` ya lo tiene)
- [ ] Skip-to-content link
- [ ] Contraste WCAG AA en dark mode (verificar badges y texto sobre fondos de glassmorphism)
- [ ] `aria-live` region para notificaciones toast
- [ ] Mensajes de error asociados a inputs via `aria-describedby`

#### 3.2 Responsive Design

- [ ] Tablas: `overflow-x-auto` + `min-width` en columnas clave + sticky primera columna
- [ ] Modales: `max-w-full` + `m-4` en mobile
- [ ] Sidebar: mejorar comportamiento en tablets (hover overlay vs expand)
- [ ] Grid de dashboard: `grid-cols-1` en mobile, `grid-cols-2` en tablet, `grid-cols-4` en desktop
- [ ] Botones de acción: full-width en mobile, inline en desktop

#### 3.3 Animaciones y Micro-interacciones

- [ ] Transiciones suaves en filtros/búsqueda (resultados aparecen con fade)
- [ ] Loading skeleton con shimmer animation (ya existe en CSS)
- [ ] Animación de filas al hacer hover en tablas
- [ ] Badge de estado con pulse animation para "pendiente"
- [ ] Confirm dialog con entrada/salida animada
- [ ] Toast stack con slide-in desde esquina

#### 3.4 Feedback y Estados

- [ ] Estados vacíos personalizados por módulo (no solo "No hay datos")
- [ ] Snackbar para acciones rápidas (copiar, eliminar, crear)
- [ ] Undo toast para eliminaciones (ej. "Trabajador eliminado. [Deshacer]")
- [ ] Contador de resultados en búsquedas
- [ ] Indicador de "guardando..." en formularios con tiempo estimado

---

### Fase 4 — Arquitectura y Rendimiento (Semana 8-9)

#### 4.1 Gestión de Estado

- [ ] Evaluar si algún módulo se beneficia de estado global (Zustand ligero o React Context)
- [ ] Cache de listas maestras (cargos, roles, categorías, motivos) para no recargar
- [ ] Refactor de `useRecepcion`, `useTalleres`, `useLibros` para compartir data maestra

#### 4.2 Code Splitting Profundo

- [ ] Lazy loading de modales pesados (TrabajadorFormModal, ObraForm, etc.)
- [ ] Split de biblioteca pdf.service.js (843 líneas) en módulos por tipo de reporte

#### 4.3 Memoización

- [ ] `React.memo` en filas de tabla, cards de dashboard
- [ ] `useMemo` para datos filtrados/ordenados (verificar que ya existen en hooks)
- [ ] `useCallback` en handlers pasados a hijos
- [ ] Virtual scrolling para tablas grandes (react-window o similar)

---

### Fase 5 — Funcionalidades Nuevas (Semana 10-12)

#### 5.1 Módulo de Notificaciones

- [ ] Central de notificaciones en el header (campanita)
- [ ] Notificaciones: aprobación de auditorio, inscripciones a talleres, cumpleaños, tareas pendientes
- [ ] Badge de contador no leído

#### 5.2 Exportación y Reportes

- [ ] Dashboard de reportes global (combinar datos de todos los módulos)
- [ ] Programación de exportaciones automáticas
- [ ] Formato XLSX además de PDF

#### 5.3 Búsqueda Global

- [ ] Command palette (Ctrl+K) para buscar en todos los módulos
- [ ] Resultados agrupados por módulo

#### 5.4 Personalización

- [ ] Tablero (dashboard) personalizable por rol/usuario
- [ ] Columnas visibles en tablas configurables
- [ ] Tema claro/oscuro por módulo (override)

---

## Priorización por Impacto y Esfuerzo

| Prioridad | Ítem | Esfuerzo | Impacto | Módulo |
|---|---|---|---|---|
| P0 | Extraer lógica de Inventario a hook | 2 días | 🔴 Crítico | Inventario |
| P0 | Extraer lógica de Auditorio a hook | 2 días | 🔴 Crítico | Auditorio |
| P0 | Componente PageHeader + Tabs unificado | 1 día | 🔴 Alto | Todos |
| P1 | AsyncContent (loading/empty/error) | 1 día | 🟠 Alto | Todos |
| P1 | Tablas responsivas sticky | 2 días | 🟠 Alto | Todos |
| P1 | Accesibilidad básica (labels, roles, keyboard) | 3 días | 🟠 Alto | Todos |
| P1 | Extraer tabs de Talleres, Biblioteca a componentes | 2 días | 🟠 Medio | Talleres, Biblioteca |
| P2 | Galería de imágenes en Inventario | 2 días | 🟡 Medio | Inventario |
| P2 | Dashboard Ingresos con gráficos | 2 días | 🟡 Medio | Ingresos |
| P2 | Notificaciones en header | 3 días | 🟡 Medio | Global |
| P2 | Estados vacíos personalizados | 1 día | 🟡 Medio | Todos |
| P3 | Búsqueda global (Ctrl+K) | 3 días | 🔵 Bajo | Global |
| P3 | Personalización de columnas | 3 días | 🔵 Bajo | Todos |
| P3 | Exportación XLSX | 2 días | 🔵 Bajo | Reportes |

---

## Arquitectura de Componentes Propuesta

```
src/
├── components/
│   ├── common/
│   │   ├── PageHeader.tsx        # Título + subtítulo + acciones
│   │   ├── PageMeta.tsx          # Ya existe
│   │   ├── ErrorBoundary.tsx     # Ya existe
│   │   ├── AsyncContent.tsx      # Loading / Empty / Error wrapper
│   │   ├── EmptyState.tsx        # Estado vacío con icono + acción
│   │   └── FilterBar.tsx         # Search + selects + sort
│   ├── ui/
│   │   ├── Tabs.tsx             # Tabs genérico con soporte ARIA
│   │   ├── InputMavet.tsx       # Input con estilo pre-aplicado
│   │   ├── SelectMavet.tsx      # Select con estilo pre-aplicado
│   │   ├── DataTable.tsx        # Tabla genérica con sort, sticky, responsive
│   │   └── ConfirmDialog.tsx    # Ya existe, mejorar animación
│   └── layout/
│       └── NotificationBell.tsx # Central de notificaciones
```

---

## Estandarización de Tabs

Cada módulo con tabs DEBE usar el nuevo componente `Tabs`:

```tsx
<Tabs
  tabs={[
    { id: "inventario", label: "Inventario", icon: Book },
    { id: "consultas", label: "Consultas en Sala", icon: Search },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

Esto elimina la duplicación del patrón:
```tsx
// ❌ Actual: repetido en 6+ archivos
<nav className="-mb-px flex space-x-8" aria-label="Tabs">
  <button className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${...}`}>
```

---

## Checklist por Módulo

### RRHH (`RRHH.tsx` + `rrhh/`)
- [ ] Extraer `TrabajadoresTable`, `UsuariosTable`
- [ ] Columnas configurables
- [ ] Dropdown de acciones en cada fila
- [ ] Badge de "Último Admin" con tooltip

### Biblioteca (`Biblioteca.tsx` + `biblioteca/`)
- [ ] Split en `InventarioTab`, `ConsultasTab`
- [ ] Búsqueda por ISBN
- [ ] Thumbnail de portada en tabla
- [ ] Vista rápida modal

### Inventario Bóveda (`InventarioBoveda.tsx` + `inventario/`)
- [ ] Hook `useInventario`
- [ ] Split: `ObraForm`, `ObraTable`, `FiltrosObra`
- [ ] Galería con Swiper
- [ ] Vista grid/cards toggle
- [ ] Drag & drop imágenes

### Talleres (`Talleres.tsx` + `talleres/`)
- [ ] Split: `PlanificadosTab`, `InscripcionesTab`, `InstructoresTab`
- [ ] Separar hook de instructores
- [ ] Timeline de sesiones
- [ ] Reporte asistencia por sesión

### Auditorio (`Auditorio.tsx`)
- [ ] Hook `useAuditorio`
- [ ] Split: `EventForm`, `EventList`, `EventCalendar`, `EventDetail`
- [ ] Visualización de conflictos de horario
- [ ] Búsqueda por código de reserva

### Recepción (`Recepcion.tsx`)
- [ ] Escáner QR inline
- [ ] Historial rápido del visitante
- [ ] Salida rápida desde búsqueda
- [ ] Registro masivo de grupos

### Ingresos (`Ingresos.tsx`)
- [ ] Gráficos Recharts mensuales
- [ ] Tabla de ingresos paginada
- [ ] Filtro fechas / tipo / motivo
- [ ] Exportar reporte PDF

### Asistencia Personal (`AsistenciaPersonal.tsx`)
- [ ] Vista card por trabajador
- [ ] Timeline de marcaciones
- [ ] Gráfico semanal de horas
- [ ] Alerta de retardo

### Educación (`Educacion.tsx`)
- [ ] Dashboard educativo con KPIs
- [ ] Calendario académico unificado
- [ ] Estadísticas de participación

---

## Notas Técnicas

- **Tailwind v4:** Usar `@utility` en `index.css` para patrones repetitivos (inputs, cards, glass).
- **React 19:** Aprovechar el nuevo `use()` hook para Suspense y data fetching futuro.
- **TypeScript:** Migrar los `any` restantes a tipos concretos. Ya existe `types/index.ts` con 403 líneas — usarlo consistentemente.
- **Tests:** No se detectó suite de testing. Considerar agregar Vitest para componentes críticos.
- **Manejo de errores:** Centralizar en el interceptor de Axios con toast global, no try-catch en cada página.

---

## Métricas de Éxito

| Métrica | Valor Actual | Objetivo |
|---|---|---|
| Líneas por página (promedio) | ~800 | < 400 |
| Tamaño de bundles (lazy) | Desconocido | < 200 KB por módulo |
| Lighthouse Accessibility | No medido | > 90 |
| Time to Interactive | No medido | < 3s |
| Componentes compartidos | ~15 | > 25 |
| Errores silenciosos (catch sin feedback) | ~8 | 0 |
| Estados vacíos personalizados | 0 | Todos los módulos |
