# Arquitectura del Proyecto

## Stack Tecnológico

| Capa       | Tecnología                          |
| ---------- | ----------------------------------- |
| Framework  | React 19 + Vite 6                   |
| Lenguaje   | TypeScript ~5.7                     |
| Estilos    | Tailwind CSS v4                     |
| Ruteo      | react-router v7                     |
| Gráficos   | ApexCharts / react-apexcharts       |
| Calendario | FullCalendar (core, daygrid, timegrid, interaction, react) |
| PDF        | jsPDF + jspdf-autotable (backend actual) |
| Drag & Drop| react-dnd (disponible, sin uso actual) |

## Estructura de Directorios

```
Fronted-Panel-Admin-Mavet/
├── docs/                    # Documentación
├── public/
│   └── images/
│       ├── error/           # 404.svg, 404-dark.svg
│       ├── grid-image/      # image-01.png ... image-06.png
│       ├── logo/            # mavet.png
│       ├── shape/           # grid-01.svg
│       └── user/            # owner.jpg, user-01.jpg ... user-05.jpg, user-17.jpg, user-22.jpg
├── src/
│   ├── components/
│   │   ├── auth/            # SignInForm, SignUpForm, AuthRoute
│   │   ├── charts/          # BarChartOne, LineChartOne
│   │   ├── common/          # PageMeta, PageBreadCrumb, ComponentCard, GridShape, ScrollToTop, ThemeToggleButton, ThemeTogglerTwo
│   │   ├── form/            # Form, Label, Select, MultiSelect, date-picker, inputs, switches
│   │   ├── header/          # NotificationDropdown, UserDropdown
│   │   ├── tables/          # BasicTableOne
│   │   ├── ui/              # Alert, Avatar, Badge, Button, Dropdown, Images, Modal, Table, Videos
│   │   └── UserProfile/     # UserMetaCard, UserInfoCard, UserAddressCard
│   ├── context/             # AuthContext, SidebarContext, ThemeContext
│   ├── hooks/               # useModal
│   ├── icons/               # 56 SVG iconos como React components
│   ├── layout/              # AppLayout, AppSidebar, AppHeader, Backdrop
│   ├── pages/
│   │   ├── AuthPages/       # SignIn, SignUp, AuthPageLayout
│   │   ├── Charts/          # BarChart, LineChart
│   │   ├── Dashboard/       # Home
│   │   ├── Forms/           # FormElements
│   │   ├── Mavet/           # Módulos del negocio (ver MODULES.md)
│   │   ├── OtherPage/       # NotFound
│   │   ├── Tables/          # BasicTables
│   │   └── UiElements/      # Alerts, Avatars, Badges, Buttons, Images, Videos
│   ├── services/            # api.ts (cliente HTTP), pdf.service.ts
│   └── types/               # index.ts (interfaces TypeScript)
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── vite.config.ts
```

## Flujo de Autenticación

1. El usuario ingresa credenciales en `SignInForm`
2. Se llama a `mavetApi.login()` → POST `/api/auth/login`
3. El backend devuelve `{ token, usuario }`
4. Se almacenan en `localStorage` (`token`, `user`)
5. `AuthContext` provee `user`, `token`, `login()`, `logout()` a toda la app
6. `AuthRoute` protege las rutas del panel; redirige a `/signin` si no hay token
7. Rutas públicas (`/asistencia`, `/registro-visitante`) usan endpoints sin autenticación

## Routing

- **React Router v7** con `BrowserRouter`
- Layout principal: `AppLayout` (sidebar + header)
- Rutas públicas: fuera del layout
- Ver `src/App.tsx` para la definición completa de rutas
