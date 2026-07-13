# Lógica Duplicada — Análisis de Unificación

## 🔴 Prioridad Alta

### 1. Capa de API duplicada (código muerto)

| Archivo | Líneas | Estado |
|---------|--------|--------|
| `src/services/api.ts` | 1–1168 | Monolítico, **usado por todos los componentes** |
| `src/services/api/` (10 archivos) | ~700 total | Modular/refactorizado, **nunca importado por nadie** |

**Problema:** El monolítico repite el patrón `Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : [])` ~8 veces. El modular ya tiene `extractPagination()` y `extractList()` en `client.ts` que evitan esa repetición, pero está muerto.

**Solución:** Eliminar `src/services/api.ts` y activar el modular. Los imports `"../services/api"` siguen funcionando porque apuntan al directorio.

---

### 2. `formatHoras` duplicado

| Archivo | Líneas |
|---------|--------|
| `src/components/AsistenciaModal.tsx` | 50–57 |
| `src/pages/Mavet/RRHH.tsx` | 21–28 |

La función es idéntica en ambos archivos.

**Solución:** Mover a `src/utils/formatters.ts` e importar desde ahí.

---

### 3. `getUserRole` no usado

La función `getUserRole(user)` existe exportada en `src/context/AuthContext.tsx:81-83`, pero solo `RRHH.tsx` la importa. Todos los demás archivos reimplementan inline:

```typescript
user?.Role?.nombre_rol || user?.rol || "Administrador"
```

Aparece en:
- `src/pages/Mavet/InventarioBoveda.tsx:30`
- `src/pages/Mavet/Biblioteca.tsx:22`
- `src/pages/Mavet/Auditorio.tsx:43`
- `src/pages/Mavet/Talleres.tsx:34`
- `src/pages/Dashboard/Home.tsx:15`
- `src/layout/AppSidebar.tsx:96`
- `src/layout/AppHeader.tsx:10`
- `src/components/auth/RoleProtectedRoute.tsx:19`

**Solución:** Usar `getUserRole(user)` en todos esos archivos.

---

## 🟡 Prioridad Media

### 4. Estado `confirm` manual en hooks vs `useConfirm`

El hook `src/hooks/useConfirm.ts` ya existe y se usa correctamente en `useRRHH.ts`, pero `useLibros.ts` (líneas 44–46) y `useTalleres.ts` (líneas 53–55) declaran su propio estado `confirm` manual con la misma estructura.

**Solución:** Reemplazar el estado manual con `useConfirm()`.

---

### 5. `ErrorBoundary` envuelve cada ruta individual

En `src/App.tsx` (líneas 91–128), cada ruta tiene su propio `<ErrorBoundary>`:

```tsx
<Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
<Route path="/profile" element={<ErrorBoundary><UserProfiles /></ErrorBoundary>} />
// ... ~15 rutas
```

**Solución:** Mover `<ErrorBoundary>` un nivel arriba (wrap de `<Routes>` completo o dentro de `AppLayout`).

---

### 6. Paginación inline vs componente compartido

`src/components/ui/Pagination.tsx` es un componente reutilizable, pero solo lo importa `RRHH.tsx`. `Biblioteca.tsx` e `InventarioBoveda.tsx` tienen botones "Anterior"/"Siguiente" hechos a mano.

**Solución:** Usar `<Pagination>` en todas las tablas paginadas.

---

## 🟢 Prioridad Baja

### 7. ThemeToggle — SVGs duplicados

`src/components/common/ThemeToggleButton.tsx` y `src/components/common/ThemeTogglerTwo.tsx` tienen los mismos SVG paths para sol/luna.

**Solución:** Extraer iconos a un archivo compartido o hacer un único componente con prop `variant`.

---

### 8. Skeleton duplicado

`src/components/ui/Skeleton.tsx` (genérico) y `src/components/ui/LoadingSkeleton.tsx` (compuesto) hacen lo mismo.

**Solución:** `LoadingSkeleton` podría usar `Skeleton` internamente, o fusionarlos.

---

### 9. Clases CSS de inputs duplicadas

Cada página define su propio string de clases para inputs:

```css
"w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none ..."
```

Aparece en `Biblioteca.tsx`, `RRHH.tsx`, `InventarioBoveda.tsx`, `Talleres.tsx`, `Auditorio.tsx`.

**Solución:** Usar `src/components/form/input/InputField.tsx` que ya tiene estos estilos incorporados.

---

### 10. Barras de búsqueda inline

El mismo patrón de input + icono de lupa se repite en:
- `InventarioBoveda.tsx:508-519`
- `Biblioteca.tsx:147-159`
- `RRHH.tsx:149-154`
- `Talleres.tsx`

**Solución:** Crear un componente `SearchBar` compartido.

---

### 11. Llamada axios directa en `useRecepcion.ts`

```typescript
const res = await axiosInstance.get(`/api/personas/buscar?q=${searchQuery}`);
```
Ya existe `mavetApi.buscarPersona(searchQuery)` en `api.ts:351-356` que hace lo mismo.

**Solución:** Reemplazar con `mavetApi.buscarPersona()`.
