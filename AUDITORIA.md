# Auditoría de Código — Panel MAVET

> **Fecha:** Julio 2026
> **Archivos analizados:** 121 `.ts`/`.tsx` en `src/`
> **Total de líneas:** ~19,300 líneas

---

## 1. Visión General

| Métrica | Valor |
|---|---|
| Archivos `.ts`/`.tsx` | 121 |
| Líneas de TS | ~5,817 |
| Líneas de TSX | ~12,351 |
| Líneas de CSS | ~1,130 |
| **Total** | **~19,300** |

---

## 2. Archivos más grandes (prioridad de refactor)

| Archivo | Líneas | Estado |
|---|---|---|
| `src/pages/Mavet/InventarioBoveda.tsx` | **1,408** | CRÍTICO — 2.5× el tamaño recomendado |
| `src/pages/Mavet/Auditorio.tsx` | **1,195** | CRÍTICO — 2× el tamaño recomendado |
| `src/services/api.ts` | **1,168** | CRÍTICO — monolito de API |
| `src/config/tourSteps.ts` | 1,051 | Aceptable — datos, no lógica |
| `src/index.css` | 1,010 | Aceptable — tema Tailwind |
| `src/pages/Mavet/Biblioteca.tsx` | 825 | Alto — requiere división |
| `src/pages/Mavet/Talleres.tsx` | 803 | Alto — requiere división |
| `src/pages/Mavet/RegistroPublico.tsx` | 614 | Alto — requiere división |
| `src/pages/Mavet/Recepcion.tsx` | 515 | Moderado |
| `src/hooks/useTalleres.ts` | 492 | Moderado |
| `src/pages/Mavet/RRHH.tsx` | 460 | Moderado |

---

## 3. Problemas Críticos

### 3.1 Código muerto — `src/services/api/` (~700 líneas)
Existe una carpeta `src/services/api/` con una versión modular dividida (client, auth, obras, biblioteca, rrhh, talleres, auditorio, recepcion, publico, papelera, dashboard, index). **Ningún archivo del proyecto la importa.** Es un refactor a medias que quedó desconectado.

### 3.2 Lógica CRUD embebida en páginas
`InventarioBoveda.tsx` contiene un CRUD completo de artistas (búsqueda, formulario crear/editar, lógica de borrado) directamente en el componente de página. Debería ser un sub-componente extraído.

### 3.3 JSX excesivamente anidado
`Auditorio.tsx` y `InventarioBoveda.tsx` tienen profundidades de 10–15 niveles de anidamiento en sus modales y formularios.

### 3.4 Sin componente de tabla reutilizable
Cada página implementa su propia tabla con paginación, filtros y maquetado Tailwind desde cero. No existe un `DataTable` o `Table` compartido.

---

## 4. Patrones Duplicados

### 4.1 Estado de ConfirmDialog (repetido 8+ veces)
Cada hook define el mismo estado:
```typescript
const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; variant: string }>({
  open: false, title: "", message: "", onConfirm: () => {}, variant: "danger",
});
```
Debería ser un hook compartido (`useConfirmDialog`).

### 4.2 Lógica de paginación duplicada
`currentPage`, `totalPages`, `totalItems`, `goToPage()` — reescrito en prácticamente cada página/hook. Solo `useLibros` extrae `goToPage` con `useCallback`.

### 4.3 Try/catch de errores repetitivo
Toda llamada API tiene el mismo patrón:
```typescript
try { ... } catch (error) { toast.error(error.message || "fallback"); }
```
No hay un manejador centralizado de errores (más allá del interceptor 401).

### 4.4 userRole fallback copiado ~10 veces
```typescript
const userRole = user?.Role?.nombre_rol || user?.rol || "Administrador";
```
Debería ser un helper desde AuthContext.

---

## 5. Inconsistencias

| Aspecto | Detalle |
|---|---|
| **Declaración de componentes** | Mezcla `export default function` y `const Component: React.FC = () =>` |
| **Importación de `mavetApi`** | Mayoría estática, `Biblioteca.tsx` hace re-import dinámico innecesario |
| **Memoización** | `useLibros` usa `useCallback`/`useMemo`; `useRecepcion` y `useRRHH` no |
| **Clases CSS** | `Talleres.tsx` define variables `inputCls`/`selectCls` a nivel módulo; otros componentes inlinean todo |
| **Comentarios** | Mezcla español/inglés, algunos con banners ASCII |
| **Tipado** | AGENTS.md permite `any`, pero hay hooks con buen tipado y otros que abusan de `any` |

---

## 6. Código Muerto / Redundancias

1. `src/services/api/` (~700 líneas) — nunca importado
2. `src/components/auth/SignUpForm.tsx` (188 líneas) — posiblemente no conectado a backend funcional
3. `Biblioteca.tsx:63` — import dinámico redundante de `mavetApi` (ya importado estáticamente en línea 15)
4. `Biblioteca.tsx:57-59` — `toastMessage` helper importa react-hot-toast dinámicamente, mientras otras funciones lo importan estático
5. `useRRHH.ts:331,340` — `exportarReporteTrabajadores`/`exportarReporteUsuarios` importados dinámicamente sin necesidad
6. `AppSidebar.tsx:77+` — `RoutePermissions` duplica el control de roles que ya existe en `RoleProtectedRoute` en `App.tsx`
7. `App.tsx:98,114` — `RoleProtectedRoute` con `allowedRoles={[]}` es confuso (significa "todos" pero parece "nadie")

---

## 7. Organización y Arquitectura

| Aspecto | Nota | Observaciones |
|---|---|---|
| **Estructura de directorios** | B+ | Separación clara: pages, hooks, components, services, context, types, utils |
| **Organización de rutas** | B | Rutas limpias en App.tsx, pero metadatos duplicados en AppSidebar.tsx |
| **Data fetching** | C- | Inconsistente: unos en hooks (bien), otros en páginas (mal). Sin React Query/SWR |
| **Estado global** | B | React Context para auth/theme/sidebar — adecuado para el tamaño del proyecto |
| **Reutilización** | D | Sin tabla, inputs grupales o componentes de paginación compartidos |
| **Capa API** | F | Dos clientes (uno muerto, uno monolito). Sin capa de transformación de datos. Mucho `any` |
| **Tipado** | D | Tipos existen pero `any` es omnipresente en respuestas API y datos de formularios |
| **Manejo de errores** | C | Interceptor 401 existe, pero el manejo página-por-página es try/catch repetitivo |
| **Abstracción de componentes** | D- | Existen primitivas (Button, Modal, InputField, Checkbox, ConfirmDialog), faltan compuestos (DataTable, FormSection) |
| **Tests** | F | No existe ningún archivo de test |

---

## 8. Prioridades Recomendadas

1. **Eliminar `src/services/api/` o conectarlo** — remover ~700 líneas de código muerto
2. **Extraer CRUD de artistas de `InventarioBoveda.tsx`** — reducir 1,408 → ~800 líneas
3. **Extraer formulario de eventos de `Auditorio.tsx`** — reducir 1,195 → ~700 líneas
4. **Crear componente `DataTable` reutilizable** — eliminar duplicación de tablas/paginación en todas las páginas
5. **Crear hook `useConfirm` compartido** — eliminar el estado duplicado de confirm dialog
6. **Extraer lógica `userRole` a AuthContext** — eliminar el fallback copiado ~10 veces
7. **Dividir `src/services/api.ts`** — usar la estructura modular ya existente o crear una nueva

---

## 9. Fortalezas

- Buena separación de concerns a nivel de directorios
- Tema Tailwind consistente con custom colors y breakpoints
- Lazy loading + code splitting correcto en todas las rutas
- Auth con JWT, roles y axios interceptors bien implementado
- React Context usado apropiadamente para temas transversales
- Manejo de imágenes rotas con fallback en `UserMetaCard.tsx`
