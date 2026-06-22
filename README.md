# Panel de Administración MAVET (Frontend)

Este es el proyecto frontend del Panel Administrativo del **Museo de Artes Visuales y del Espacio del Táchira (MAVET)**. Está construido como una aplicación de una sola página (SPA) moderna, enfocada en el rendimiento, la escalabilidad y una experiencia de usuario (UX) rica y dinámica.

## 🚀 Stack Tecnológico Principal

- **Framework:** React 19 + Vite
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4.0 (con PostCSS)
- **Enrutamiento:** React Router v7

## 📦 Dependencias Instaladas

### Dependencias Principales (Dependencies)
- `@fullcalendar/react` y complementos (core, daygrid, interaction, timegrid): Para los calendarios interactivos de eventos y auditorios.
- `apexcharts` / `react-apexcharts`: Para los gráficos del Dashboard y métricas analíticas.
- `axios`: Cliente HTTP para consumir la API del backend.
- `react-dropzone`: Para carga drag-and-drop de archivos/imágenes.
- `react-hot-toast`: Alertas y notificaciones elegantes (Toasts).
- `jspdf` y `jspdf-autotable`: Para generación y exportación de reportes PDF y códigos QR.
- `lucide-react`: Biblioteca moderna de iconos.
- `swiper`: Para carruseles táctiles y galerías de imágenes.
- `react-helmet-async`: Manejo dinámico del `<head>` y metadatos SEO.
- `flatpickr`: Selectores de fecha avanzados.

### Dependencias de Desarrollo (DevDependencies)
- `typescript` / `@types/react`
- `eslint` y plugins de React para asegurar la calidad del código.
- `tailwindcss` / `@tailwindcss/postcss`
- `vite-plugin-svgr`: Soporte para importar SVGs como componentes de React.

## 💻 Instalación y Uso Local

Asegúrate de tener **Node.js (v18 o superior)** instalado.

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Levantar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *Esto iniciará Vite en `http://localhost:5173` y se expondrá en la red local gracias a la flag `--host`.*

3. **Construir para producción:**
   ```bash
   npm run build
   ```

## 📁 Estructura Principal
- `/src/pages`: Contiene todas las pantallas principales (Dashboard, Recepción, RRHH, Bóveda, etc.)
- `/src/components`: Componentes reutilizables (Modales, Tarjetas, Botones).
- `/src/services/api.ts`: Centraliza la comunicación Axios con el Backend MAVET.
- `/src/layout`: Envolturas principales como Sidebar, Header y la capa de autenticación.

## 🛡️ Notas de Seguridad
Este frontend depende del uso de un token JWT almacenado en `localStorage`. Todas las peticiones al backend adjuntan este token vía Interceptores de Axios.
