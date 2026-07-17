# Panel de Administración MAVET

Frontend administrativo del **Museo de Artes Visuales y del Espacio del Táchira**. SPA con dashboards por rol, gestión de RRHH, obras, biblioteca, talleres, auditorio, recepción y más.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite 6 |
| Routing | React Router v7 |
| Estilos | Tailwind CSS v4 + PostCSS |
| Formularios | React Hook Form + Zod v4 |
| API Client | Axios (interceptors, withCredentials) |
| Auth | JWT en cookie httpOnly (contexto de autenticación) |
| Iconos | Lucide React |
| Gráficos | Recharts |
| QR | html5-qrcode (lector) + jspdf (generación) |
| PDF | jspdf + jspdf-autotable |
| Calendario | flatpickr |
| Tour guiado | driver.js |
| Notificaciones | react-hot-toast |
| Carruseles | Swiper 11 |

---

## Estructura

```
src/
├── components/
│   ├── auth/
│   │   ├── AuthRoute.tsx              # Protege rutas autenticadas
│   │   ├── RoleProtectedRoute.tsx     # Protege rutas por rol
│   │   ├── SignInForm.tsx             # Formulario de inicio de sesión
│   │   └── SignUpForm.tsx             # Formulario de registro
│   ├── common/
│   │   ├── ComponentCard.tsx          # Card wrapper para secciones
│   │   ├── ErrorBoundary.tsx          # Captura errores de React
│   │   ├── GridShape.tsx              # Fondo decorativo con grid
│   │   ├── PageBreadCrumb.tsx         # Migas de pan
│   │   ├── PageMeta.tsx               # Metadatos SEO
│   │   ├── ScrollToTop.tsx            # Scroll-to-top
│   │   └── ThemeToggleButton.tsx      # Botón dark/light mode
│   ├── form/
│   │   ├── input/InputField.tsx       # Input reutilizable
│   │   ├── input/Checkbox.tsx         # Checkbox reutilizable
│   │   └── Label.tsx                  # Label component
│   ├── header/
│   │   └── UserDropdown.tsx           # Menú de usuario en header
│   ├── ui/
│   │   ├── button/Button.tsx          # Botón con variantes
│   │   ├── dropdown/DropdownItem.tsx  # Item de dropdown
│   │   ├── modal/index.tsx             # Modal reutilizable
│   │   ├── ConfirmDialog.tsx          # Confirmación de acciones
│   │   ├── HistorialObraModal.tsx     # Modal de historial de obra
│   │   ├── LoadingSkeleton.tsx        # Skeleton loader
│   │   ├── Pagination.tsx             # Paginación
│   │   ├── PasswordRules.tsx          # Reglas de contraseña
│   │   ├── PasswordStrengthMeter.tsx  # Indicador de fortaleza
│   │   ├── PrivacyConsent.tsx         # Consentimiento de datos
│   │   ├── SessionTimeoutModal.tsx    # Modal de sesión expirada
│   │   └── Skeleton.tsx              # Skeleton base
│   ├── AsistenciaModal.tsx            # Modal de asistencia
│   ├── CalendarGrid.tsx               # Grid de calendario
│   ├── Footer.tsx                     # Footer de la app
│   ├── LoadingScreen.tsx              # Pantalla de carga inicial
│   ├── TourFab.tsx                    # Botón flotante de tour
│   └── WelcomeTourModal.tsx           # Modal de bienvenida con tour
│
├── config/
│   ├── tourHelpers.ts                 # Helpers para el tour guiado
│   └── tourSteps.ts                   # Pasos del tour guiado
│
├── context/
│   ├── AuthContext.tsx                # Estado de autenticación global
│   ├── SidebarContext.tsx             # Estado del menú lateral
│   ├── ThemeContext.tsx               # Tema dark/light
│   └── TourContext.tsx                # Estado del tour guiado
│
├── hooks/
│   ├── useConfirm.ts                  # Hook de confirmación
│   ├── useDebounce.ts                 # Debounce hook
│   ├── useModal.ts                    # Hook de modal
│   ├── useRecepcion.ts               # Lógica de recepción
│   ├── useRRHH.ts                     # Lógica de RRHH
│   ├── useSessionTimeout.ts           # Timeout de sesión
│   ├── useTalleres.ts                # Lógica de talleres
│   ├── useTalleresInscripciones.ts   # Inscripciones a talleres
│   ├── useTalleresInstructor.ts      # Instructores de talleres
│   ├── useTour.ts                     # Hook del tour
│   └── useLibros.ts                  # Lógica de biblioteca
│
├── layout/
│   ├── AppHeader.tsx                  # Header con dropdowns
│   ├── AppLayout.tsx                  # Layout con sidebar + header + outlet
│   ├── AppSidebar.tsx                 # Menú lateral responsive
│   └── Backdrop.tsx                   # Backdrop para móvil
│
├── pages/
│   ├── AuthPages/
│   │   ├── AuthPageLayout.tsx        # Layout de páginas de auth
│   │   ├── SignIn.tsx                # Inicio de sesión
│   │   └── SignUp.tsx                # Registro
│   ├── Dashboard/
│   │   ├── Home.tsx                  # Dashboard principal
│   │   ├── GerenteDashboard.tsx      # Dashboard de Gerente
│   │   ├── RecepcionistaDashboard.tsx# Dashboard de Recepción
│   │   ├── CuradorDashboard.tsx      # Dashboard de Curador
│   │   ├── BibliotecarioDashboard.tsx# Dashboard de Bibliotecario
│   │   └── EducadorDashboard.tsx     # Dashboard de Educador
│   ├── Mavet/
│   │   ├── RRHH.tsx                  # Gestión de RRHH
│   │   ├── Biblioteca.tsx            # Gestión de biblioteca
│   │   ├── InventarioBoveda.tsx      # Inventario de obras (bóveda)
│   │   ├── Talleres.tsx              # Gestión de talleres
│   │   ├── Auditorio.tsx             # Reservas de auditorio
│   │   ├── Educacion.tsx             # Gestión educativa
│   │   ├── Ingresos.tsx              # Historial de ingresos
│   │   ├── Recepcion.tsx             # Panel de recepción
│   │   ├── RegistroPublico.tsx       # Auto-registro vía QR
│   │   ├── Papelera.tsx              # Papelera de reciclaje
│   │   ├── AuditLogs.tsx             # Registro de auditoría
│   │   ├── ManualUsuario.tsx         # Manual de usuario
│   │   ├── Salas.tsx                 # Gestión de salas
│   │   └── biblioteca/               # Modales de biblioteca
│   │       ├── LibroDetailModal.tsx
│   │       ├── LibroFormModal.tsx
│   │       └── PrestamoFormModal.tsx
│   │   ├── rrhh/                     # Modales de RRHH
│   │       ├── TrabajadorDetailModal.tsx
│   │       ├── TrabajadorFormModal.tsx
│   │       ├── UsuarioFormModal.tsx
│   │       ├── ExportarAsistenciaModal.tsx
│   │       ├── JustificacionModal.tsx
│   │       └── ObservacionModal.tsx
│   │   └── talleres/                 # Modales de talleres
│   │       ├── TallerDetailModal.tsx
│   │       ├── TallerFormModal.tsx
│   │       ├── InscripcionModal.tsx
│   │       └── SesionesTallerModal.tsx
│   ├── UserProfiles.tsx              # Perfil de usuario
│   └── OtherPage/NotFound.tsx        # Página 404
│
├── services/
│   ├── api/
│   │   ├── client.ts                 # Axios instance + interceptors + helpers
│   │   ├── index.ts                  # Barrel export (mavetApi)
│   │   ├── auth.ts                   # login, register, getMe, etc.
│   │   ├── rrhh.ts                   # CRUD trabajadores, asistencias, horarios
│   │   ├── biblioteca.ts             # CRUD libros, autores, categorías, consultas
│   │   ├── obras.ts                  # CRUD obras, artistas, catálogos, imágenes
│   │   ├── recepcion.ts             # Ingresos, motivos de visita
│   │   ├── talleres.ts              # CRUD talleres, sesiones, inscripciones
│   │   ├── auditorio.ts             # Solicitudes de espacio
│   │   ├── dashboard.ts             # Estadísticas del dashboard
│   │   ├── papelera.ts              # Papelera de reciclaje
│   │   └── publico.ts               # QR auto-ingreso
│   └── pdf.service.ts               # Generación de PDFs desde el frontend
│
├── types/
│   └── index.ts                      # Interfaces TypeScript (284 líneas)
│
├── utils/
│   ├── formatters.ts                 # Formatos de fecha, moneda, etc.
│   ├── validation.ts                 # Validaciones reutilizables
│   ├── codeGenerator.ts              # Generación de códigos
│   └── imageCompression.ts           # Compresión de imágenes en cliente
│
├── App.tsx                           # Router global + AuthProvider + Toaster
├── main.tsx                          # Entry point
└── index.css                         # Estilos globales + Tailwind
```

---

## Routing y Roles

### Rutas públicas
| Ruta | Página |
|---|---|
| `/signin` | Inicio de sesión |
| `/signup` | Registro |
| `/registro-visitante` | Auto-registro público QR |

### Rutas protegidas (requieren autenticación + layout con sidebar)

| Ruta | Página | Roles permitidos |
|---|---|---|
| `/` | Dashboard | Todos los autenticados |
| `/profile` | Perfil de usuario | Todos |
| `/biblioteca` | Biblioteca | Bibliotecario, Gerente |
| `/rrhh` | RRHH | Gerente |
| `/recepcion` | Recepción | Recepcionista, Gerente |
| `/ingresos` | Ingresos | Recepcionista, Gerente |
| `/educacion` | Educación | Educador, Gerente |
| `/talleres` | Talleres | Educador, Gerente |
| `/auditorio` | Auditorio | Educador, Gerente |
| `/inventario-obras` | Inventario (bóveda) | Curador, Restaurador, Gerente |
| `/papelera` | Papelera | Solo Administrador |
| `/auditoria` | Auditoría | Administrador, Gerente |
| `/manual` | Manual de usuario | Todos |

### Mecanismo de protección
1. `AuthRoute` verifica que el usuario esté autenticado (vía cookie JWT)
2. `AppLayout` provee sidebar + header + outlet
3. `RoleProtectedRoute` verifica el rol del usuario contra `allowedRoles`
4. Si no tiene permisos, redirige al dashboard

---

## API Client

`services/api/client.ts` configura Axios con:
- `baseURL: VITE_API_URL` → `https://backend-panel-admin-mavet.onrender.com`
- `withCredentials: true` (cookies JWT)
- Interceptor 401 → redirige a `/signin`

Módulos API: `auth`, `rrhh`, `biblioteca`, `obras`, `recepcion`, `talleres`, `auditorio`, `dashboard`, `papelera`, `publico`.

### Tipos de Respuesta

El backend envuelve respuestas en `{ status, data, message, meta }`. Los helpers `extractPagination` y `extractList` normalizan los datos.

---

## Contextos Globales

| Contexto | Estado | Persistencia |
|---|---|---|
| `AuthContext` | user, token, isLoading | localStorage + cookie JWT |
| `SidebarContext` | sidebar abierto/cerrado | Estado local |
| `ThemeContext` | dark/light mode | localStorage |
| `TourContext` | tour activo/completado | localStorage |

---

## Variables de Entorno

```env
VITE_API_URL=https://backend-panel-admin-mavet.onrender.com
```
