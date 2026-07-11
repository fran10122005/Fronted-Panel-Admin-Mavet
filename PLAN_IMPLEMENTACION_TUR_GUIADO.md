# Plan de Implementación — Tour Guiado con Driver.js

## Panel Administrativo MAVET

Basado en: `Manual_MAVET_Guia_Visual_Estilo_Instructivo_CORREGIDO.pdf` (30 páginas, 27 procesos)

---

## Fase 1 — Instalación y configuración base

### 1.1 Instalar Driver.js

```bash
npm install driver.js
```

### 1.2 Importar estilos base en `src/main.tsx`

```tsx
import "driver.js/dist/driver.css";
```

> Los estilos se sobrescribirán con los colores `brand-*` y tipografía de MAVET en la Fase 6.

---

## Fase 2 — Arquitectura del tour

### 2.1 Hook personalizado: `src/hooks/useTour.ts`

Hook que encapsula la lógica de Driver.js:

- **Propósito:** Crear y controlar una instancia de Driver.js
- **Estado:** `isActive` (boolean)
- **Métodos expuestos:**
  - `startTour(steps)` — iniciar el tour con los pasos dados
  - `stopTour()` — detener el tour
  - `setSteps(steps)` — cambiar la configuración de pasos
- **Configuración global:** `animate: true`, `overlayColor` (según tema), `showProgress: true`
- **Persistencia:** Guardar en `localStorage` si el tour ya se completó (`tour_completed`)

### 2.2 Componente: `src/components/TourFab.tsx`

Botón flotante de ayuda "?" en la esquina inferior derecha:

- Visible en todas las páginas del layout protegido
- Al hacer clic, abre un menú contextual con:
  - "Tour general del panel" — tour completo de navegación
  - "Tour de esta página" — tour específico del módulo actual
  - "No mostrar más" — desactiva el FAB
- **Estilo:** `bg-brand-600`, sombra, `z-50`
- **Tooltip al hover:** "Ayuda interactiva"
- **Responsive:** se oculta en mobile (< 768px) o se integra en el header

### 2.3 Contexto: `src/context/TourContext.tsx`

Contexto global para compartir el estado del tour:

- `currentPage`: string con la ruta actual
- `registerPageTour(ruta, steps)`: registrar los pasos del tour para una página
- `startPageTour()`: iniciar el tour de la página actual
- `startGlobalTour()`: iniciar el tour global del panel
- `hasSeenTour`: boolean del localStorage
- `markTourAsSeen()`: marca el tour como completado

---

## Fase 3 — Sistema de pasos (TourSteps)

### 3.1 Archivo de configuración: `src/config/tourSteps.ts`

Se define un objeto que mapea cada ruta a sus pasos:

```ts
export interface TourStep {
  element: string;       // Selector CSS
  popover: {
    title: string;
    description: string;
    side?: "left" | "right" | "top" | "bottom";
    align?: "start" | "center" | "end";
  };
}

export type PageTourMap = Record<string, TourStep[]>;
```

### 3.2 Pasos del tour global (panel completo)

Tomando como base la **Sección 3** (Navegación general del dashboard) + **Sección 5** (Indicadores) del manual:

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | `aside` | Menú lateral | "Navegue entre los módulos: Dashboard, Auditorio, Recepción, Talleres, Bóveda, Biblioteca y RRHH." |
| 2 | `header` | Barra superior | "Acceda a su perfil, alternar tema oscuro, papelera y cierre de sesión." |
| 3 | `header` button[aria-label="Toggle Sidebar"] | Colapsar menú | "Oculte el menú lateral para tener más espacio de trabajo." |
| 4 | Tarjetas de KPIs (primer widget tras header) | Indicadores | "Revise métricas como obras en bóveda, visitantes y eventos." |
| 5 | Widget "Próximos Eventos" | Eventos | "Consulte las actividades programadas del museo." |
| 6 | Gráfico de visitantes (Dashboard) | Flujo de visitantes | "Visualice el movimiento de visitantes del mes." |

### 3.3 Tour por módulos

#### Dashboard (`/`)

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | KPI "Obras en Bóveda" | Obras en Bóveda | "Total de piezas artísticas registradas en el inventario." |
| 2 | KPI "Títulos en Biblioteca" | Biblioteca | "Total de libros disponibles en el catálogo." |
| 3 | KPI "Visitantes Registrados" | Visitantes | "Acumulado de ingresos registrados en el museo." |
| 4 | KPI "Eventos Programados" | Eventos | "Agenda activa de eventos del museo." |
| 5 | Widget "Próximos Eventos" | Próximos Eventos | "Revise actividades cercanas. Use 'Ver Auditorio' para ir al calendario." |
| 6 | Widget "Visitantes Frecuentes" | Top Visitantes | "Ranking de los 3 visitantes más frecuentes del mes." |
| 7 | Widget "Últimas Obras" | Últimas Obras | "Obras registradas recientemente en la bóveda." |

#### Auditorio (`/auditorio`) — Secciones 6, 7, 8 del manual

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | Input de búsqueda | Buscar eventos | "Localice eventos por título, organizador o código." |
| 2 | Selector de tipos | Filtrar por tipo | "Filtre por Conferencia, Exposición, Taller o Reunión." |
| 3 | Botón "Exportar PDF" | Exportar | "Descargue el historial de eventos del auditorio." |
| 4 | Botón "Nueva Reserva" | Crear reserva | "Registre una nueva actividad en el calendario." |
| 5 | Leyenda de colores | Leyenda | "Identifique el tipo de evento por color." |
| 6 | Calendario | Calendario | "Navegue entre meses con las flechas. Haga clic en un evento para ver/editar." |
| 7 | Botón "Gestión de Salas" | Salas | "Administre los espacios del museo (nombre, código, capacidad)." |

#### Recepción (`/recepcion`) — Secciones 9-16 del manual

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | Buscador de visitantes | Buscar persona | "Busque por cédula, nombre o teléfono. Escriba al menos 3 caracteres." |
| 2 | Formulario de ingreso | Registrar ingreso | "Complete datos del visitante, seleccione motivo y registre la entrada." |
| 3 | Botón "Asistencia Personal" | Asistencia personal | "Registre entrada/salida de trabajadores con QR o cédula." |
| 4 | Botón "Generar QR Público" | QR público | "Cree un código QR para que visitantes se auto-registren." |
| 5 | Agenda de Hoy | Agenda del día | "Consulte los eventos programados para hoy." |
| 6 | Tabla de Ingresos | Ingresos registrados | "Historial de ingresos del día con filtros Hoy/Mes/Año." |

#### Talleres (`/talleres`) — Secciones 17-19 del manual

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | KPIs de talleres | Indicadores | "Talleres activos, alumnos inscritos y talleres en inventario." |
| 2 | Botón "Gestionar Instructores" | Instructores | "Registre y consulte facilitadores disponibles." |
| 3 | Botón "Planificar Taller" | Planificar | "Cree una nueva edición de taller con instructor, fecha y cupos." |
| 4 | Lista de talleres planificados | Talleres | "Revise nombre, instructor, fecha y estado de cada taller." |
| 5 | Acordeón "Alumnos Inscritos" | Inscritos | "Expanda para ver alumnos inscritos por taller." |
| 6 | Inventario de Talleres | Inventario | "Catálogo maestro de talleres disponibles." |

#### Inventario Bóveda (`/inventario-obras`) — Secciones 20-22 del manual

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | Botón "Registrar Obra" | Nueva obra | "Ingrese una obra al inventario patrimonial." |
| 2 | Botón "Nuevo Artista" | Artistas | "Cree la ficha de un artista para asociarlo a obras." |
| 3 | Buscador de obras | Buscar obras | "Busque por código, título o autor." |
| 4 | Filtro por estado | Filtrar | "Depure resultados por estado de la obra." |
| 5 | Tabla de obras | Inventario | "Revise código, título, autor, categoría, ubicación y estado." |
| 6 | Tabla de artistas | Artistas registrados | "Consulte y administre los artistas del catálogo." |
| 7 | Botón "Exportar PDF" | Exportar | "Descargue el inventario completo de obras." |

#### Biblioteca (`/biblioteca`) — Secciones 23-24 del manual

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | Botón "Exportar PDF" | Exportar | "Descargue el catálogo de la biblioteca." |
| 2 | Buscador de libros | Buscar libro | "Busque por unidad, título o autor." |
| 3 | Filtros de biblioteca | Filtrar | "Filtre por estado, categoría y autor." |
| 4 | Tabla de inventario | Catálogo | "Revise unidad, título, autor, estante, categoría, disponibilidad." |
| 5 | Botón "Prestar" | Préstamo | "Inicie el flujo de préstamo de un ejemplar." |
| 6 | Bloque "Control de Préstamos por Cédula" | Préstamos por cédula | "Busque historial de préstamos de un solicitante específico." |

#### RRHH (`/rrhh`) — Secciones 25-27 del manual

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | Pestaña "Trabajadores" | Trabajadores | "Gestione el personal: registre, edite y genere carnets." |
| 2 | Pestaña "Usuarios" | Usuarios del sistema | "Cree cuentas de acceso, asigne roles y restablezca contraseñas." |
| 3 | Pestaña "Asistencias" | Asistencias | "Audite entradas, salidas y horas trabajadas del personal." |
| 4 | Botón "Registrar Trabajador" | Nuevo trabajador | "Complete datos del empleado y defina cargo y horario." |
| 5 | Botón carnet (en tabla) | Generar carnet | "Descargue el carnet institucional con QR de asistencia." |

#### Papelera (`/papelera`) — Sección 4 del manual

| # | Elemento | Título | Descripción |
|---|----------|--------|-------------|
| 1 | Tabla de eliminados | Registros eliminados | "Revise elementos eliminados por tipo, título y fecha." |
| 2 | Botón "Restaurar" | Restaurar | "Devuelva el registro a su módulo original." |
| 3 | Botón "Eliminar permanentemente" | Eliminación definitiva | "Use solo con autorización. La acción no se puede deshacer." |

---

## Fase 4 — Personalización visual (estilos MAVET)

### 4.1 Sobrescribir estilos de Driver.js

Crear archivo `src/styles/driver-overrides.css` con:

```css
/* Popover */
.driver-popover {
  background-color: theme(colors.white) !important;
  border: 1px solid theme(colors.gray.200) !important;
  border-radius: 1rem !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  font-family: "Playfair Display", serif !important;
}

.dark .driver-popover {
  background-color: theme(colors.gray.800) !important;
  border-color: theme(colors.gray.700) !important;
  color: theme(colors.white) !important;
}

/* Título */
.driver-popover-title {
  font-size: 1.125rem !important;
  font-weight: 700 !important;
  color: theme(colors.brand.600) !important;
}

.dark .driver-popover-title {
  color: theme(colors.brand.300) !important;
}

/* Descripción */
.driver-popover-description {
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
}

/* Botones */
.driver-popover-prev-btn,
.driver-popover-next-btn {
  border-radius: 0.5rem !important;
  font-weight: 600 !important;
  font-size: 0.8125rem !important;
  padding: 0.5rem 1rem !important;
}

.driver-popover-next-btn {
  background-color: theme(colors.brand.600) !important;
  border-color: theme(colors.brand.600) !important;
  color: white !important;
}

.driver-popover-prev-btn {
  color: theme(colors.brand.600) !important;
}

/* Progress */
.driver-popover-progress-text {
  font-size: 0.75rem !important;
  color: theme(colors.gray.400) !important;
}

/* Close button */
.driver-popover-close-btn {
  color: theme(colors.gray.400) !important;
}

.driver-popover-close-btn:hover {
  color: theme(colors.gray.600) !important;
}

/* Overlay */
.driver-overlay {
  background-color: rgba(0, 0, 0, 0.5) !important;
}
```

### 4.2 Integrar en `src/main.tsx`

```tsx
import "./styles/driver-overrides.css";
```

---

## Fase 5 — Integración en el layout

### 5.1 Tour global automático al primer ingreso

En `AppLayout.tsx`:

- Detectar si es la primera vez del usuario (`localStorage`)
- Si es primera vez, mostrar un saludo modal y ofrecer iniciar el tour
- Botones: "Comenzar tour" / "Saltar"

### 5.2 Botón FAB en `AppLayout.tsx`

Renderizar `<TourFab />` en todas las rutas protegidas.

### 5.3 Navegación por pasos

Si el usuario hace clic en "Tour de esta página", se inicia el tour específico del módulo actual detectando la ruta.

---

## Fase 6 — Delivery y despliegue

### 6.1 Resumen de archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/hooks/useTour.ts` | Hook principal de Driver.js |
| `src/config/tourSteps.ts` | Definición de todos los pasos por módulo |
| `src/components/TourFab.tsx` | Botón flotante de ayuda |
| `src/context/TourContext.tsx` | Contexto global del tour |
| `src/styles/driver-overrides.css` | Sobrescritura de estilos con tema MAVET |

### 6.2 Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/main.tsx` | Importar estilos de Driver.js + overrides |
| `src/layout/AppLayout.tsx` | Renderizar `<TourFab />`, lógica de primer ingreso |
| `package.json` | Agregar dependencia `driver.js` |

### 6.3 Orden de implementación

1. Instalar dependencia
2. Crear estilos override
3. Importar estilos en `main.tsx`
4. Crear hook `useTour.ts`
5. Crear contexto `TourContext.tsx`
6. Crear archivo de pasos `tourSteps.ts`
7. Crear componente `TourFab.tsx`
8. Integrar en `AppLayout.tsx`
9. Probar cada tour por módulo
10. Ajustar selectores CSS según necesidad

---

## Fase 7 — Pruebas y validación

### 7.1 Verificar en cada módulo

- [ ] Dashboard: tour completo de KPIs y widgets
- [ ] Auditorio: calendario, reservas, salas
- [ ] Recepción: búsqueda, registro, QR, asistencia
- [ ] Talleres: instructores, planificación, inscripciones
- [ ] Bóveda: obras, artistas, filtros
- [ ] Biblioteca: catálogo, préstamos
- [ ] RRHH: trabajadores, usuarios, asistencias
- [ ] Papelera: restaurar, eliminar

### 7.2 Verificar responsive

- [ ] Funciona en mobile (los tooltips se adaptan)
- [ ] FAB visible/oculto según tamaño de pantalla

### 7.3 Verificar tema oscuro

- [ ] Popovers se ven correctamente en modo oscuro
- [ ] Overlay se adapta al tema

---

## Resumen de tiempos estimados

| Fase | Descripción | Tiempo estimado |
|------|-------------|-----------------|
| 1 | Instalación | 5 min |
| 2 | Arquitectura (hook, componente, contexto) | 45 min |
| 3 | Configuración de pasos (todos los módulos) | 60 min |
| 4 | Personalización visual | 20 min |
| 5 | Integración en layout | 20 min |
| 6 | Pruebas y ajustes | 30 min |
| **Total** | | **~3 horas** |

---

*Documento creado el 10 de julio de 2026 — basado en el Manual_MAVET_Guia_Visual_Estilo_Instructivo_CORREGIDO.pdf*
