# Setup y Desarrollo

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalación

```bash
npm install
```

## Comandos

| Comando             | Descripción                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Inicia servidor de desarrollo (Vite)      |
| `npm run build`     | Compila TypeScript y construye producción |
| `npm run lint`      | Ejecuta ESLint en todo el proyecto        |
| `npm run preview`   | Previsualiza build de producción          |

## Variables de Entorno

Crear un archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:3000
```

El archivo `.env` está en `.gitignore` y no se sube al repositorio.

## Backend

El frontend se conecta a un backend en `http://localhost:3000`. Asegúrate de tener el servidor backend corriendo antes de usar las funcionalidades que requieren API.

## Despliegue

```bash
npm run build
```

El build se genera en el directorio `dist/`. Los archivos estáticos pueden servirse con cualquier servidor web (Nginx, Apache, etc.).

### Construcción para Entorno Específico

Si necesitas apuntar a un backend diferente en producción, crea archivos `.env.production.local`:

```env
VITE_API_URL=https://api.mavet.gob.ve
```

## Notas

- El proyecto usa **Vite** como bundler — desarrollo rápido con HMR
- **TypeScript** en modo estricto (`strict: true` en tsconfig)
- Los estilos usan **Tailwind CSS v4** con el plugin `@tailwindcss/postcss`
- Los SVG en `src/icons/` se importan como componentes React via `vite-plugin-svgr`
