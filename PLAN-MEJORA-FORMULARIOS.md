# Plan de Mejora — Formularios del Panel MAVET

> **Proyecto:** Panel MAVET
> **Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4
> **Fecha:** Julio 2026

---

## Diagnóstico General

| Aspecto | Hallazgo |
|---|---|
| **Validación** | 3 sistemas distintos conviviendo: manual con `fieldErrors`, manual con `formError`, y `react-hook-form + zod` (solo en 4 modales) |
| **Componentes de input** | Dos sistemas paralelos: `ui/TextField.tsx` (app principal) y `form/InputField.tsx` (solo auth) con APIs distintas |
| **CSS duplicado** | `inputCls`, `selectCls`, `labelCls` definidos manualmente en 7+ archivos con valores casi idénticos |
| **Patrón de modal** | Cada modal implementa su propio layout header/body/footer manualmente |
| **Banner de error** | El mismo patrón `bg-red-50 + AlertCircle + formError` se replica en ~10 lugares |
| **Botón submit** | Cada modal crea su propio spinner + lógica `disabled` inline |
| **Secciones de formulario** | El patrón `bg-gray-50 rounded-xl p-4 border` con ícono + título se repite sin componente encapsulado |
| **Tamaño de texto de error** | `text-xs` y `text-[11px]` mezclados sin criterio uniforme |
| **Tipado** | Forms manuales usan `any` frecuentemente; `react-hook-form + zod` tiene tipado completo |

---

## Plan de Implementación por Fases

### Fase 1 — Infraestructura Compartida (Semana 1)

#### 1.1 Componente `FormSection`

Encapsular el patrón recurrente de secciones dentro de formularios.

```
src/components/ui/form/
  FormSection.tsx
  FormErrorBanner.tsx
  SubmitButton.tsx
  index.ts
```

**`FormSection.tsx`**
```tsx
interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}
```

**Uso esperado:**
```tsx
<FormSection icon={<UserIcon />} title="Datos Personales">
  <TextField label="Nombres" {...register("nombres")} error={errors.nombres?.message} />
  <TextField label="Apellidos" {...register("apellidos")} error={errors.apellidos?.message} />
</FormSection>
```

---

#### 1.2 Componente `FormErrorBanner`

Unificar el banner de error global del formulario.

**`FormErrorBanner.tsx`**
```tsx
interface FormErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}
```

**Uso esperado:**
```tsx
{formError && <FormErrorBanner message={formError} onDismiss={() => setFormError("")} />}
```

---

#### 1.3 Componente `SubmitButton`

Botón con estado de carga y texto dinámico.

**`SubmitButton.tsx`**
```tsx
interface SubmitButtonProps {
  isSubmitting: boolean;
  isEditing?: boolean;
  labelNew?: string;
  labelEdit?: string;
  className?: string;
}
```

**Uso esperado:**
```tsx
<SubmitButton isSubmitting={isSubmitting} isEditing={isEditing} />
<!-- "Crear Taller" / "Actualizar Taller" automático -->
```

---

#### 1.4 Hook `useFormValidation`

Hook genérico para forms manuales que no se puedan migrar de inmediato.

```ts
function useFormValidation<T extends Record<string, any>>(initialErrors?: T) {
  // Retorna: errors, setError, clearErrors, clearAll, hasErrors, validateField
}
```

---

### Fase 2 — Migración a `react-hook-form + zod` (Semana 2-3)

#### 2.1 Orden de migración

| Prioridad | Formulario | Archivo | Líneas estimadas de ahorro |
|---|---|---|---|
| 1 | Inventario de obras | `InventarioBoveda.tsx` + `useInventario.ts` | ~120 |
| 2 | Salas/Espacios | `Salas.tsx` | ~80 |
| 3 | Eventos de Auditorio | `Auditorio.tsx` + `useAuditorio.ts` | ~100 |
| 4 | Inventario de talleres | `TallerFormModal.tsx` | ~40 |
| 5 | Planificar taller | `TallerDetailModal.tsx` | ~100 |
| 6 | Inscripción taller | `InscripcionModal.tsx` | ~40 |
| 7 | Registro en Recepción | `Recepcion.tsx` + `useRecepcion.ts` | ~60 |
| 8 | Movimientos de obra | `HistorialObraModal.tsx` | ~50 |

**Total estimado de líneas eliminadas:** ~590 líneas de validación manual.

#### 2.2 Esquema base para cada formulario

```ts
import { z } from "zod";

const tallerInventarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
});

type TallerInventarioForm = z.infer<typeof tallerInventarioSchema>;
```

---

### Fase 3 — Eliminación de CSS Duplicado (Semana 3)

#### 3.1 Centralizar clases base

Crear `src/styles/forms.ts` o `src/utils/formClasses.ts`:

```ts
export const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:text-white/90 dark:bg-gray-900";
export const selectCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 dark:bg-gray-900";
export const labelCls = "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";
export const errorCls = "text-xs text-red-500 mt-1";
```

#### 3.2 Archivos que actualizar

| Archivo | Clases a reemplazar |
|---|---|
| `src/pages/Mavet/Talleres.tsx` | `inputCls`, `selectCls` |
| `src/pages/Mavet/Salas.tsx` | `inputCls`, `selectCls` |
| `src/pages/Mavet/Auditorio.tsx` | `inputCls`, `selectCls`, `labelCls` |
| `src/pages/Mavet/Recepcion.tsx` | `inputCls` |
| `src/pages/Mavet/Biblioteca.tsx` | `inputCls` |
| `src/pages/Mavet/Ingresos.tsx` | `inputCls` |
| `src/pages/Mavet/InventarioBoveda.tsx` | `inputCls`, `selectCls`, `labelCls` |
| `src/pages/Mavet/talleres/TallerFormModal.tsx` | `inputCls` |
| `src/pages/Mavet/talleres/TallerDetailModal.tsx` | `inputCls`, `selectCls` |
| `src/pages/Mavet/talleres/InscripcionModal.tsx` | `inputCls`, `selectCls` |

---

### Fase 4 — Estandarización de Modales (Semana 4)

#### 4.1 Componente `FormModal`

```tsx
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  formError?: string;
  onDismissError?: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  maxWidth?: string;
}
```

**Uso esperado (reemplazaría ~30 líneas por modal):**

```tsx
<FormModal
  isOpen={isOpen}
  onClose={onClose}
  title="Agregar Taller"
  subtitle="Nuevo taller en el inventario maestro"
  formError={formError}
  isSubmitting={isSubmitting}
  isEditing={isEditing}
  onSubmit={handleSubmit}
>
  <FormSection icon={<BookIcon />} title="Información del Taller">
    <TextField label="Nombre" {...} />
    <TextField label="Descripción" {...} />
  </FormSection>
</FormModal>
```

---

### Fase 5 — Eliminar Sistema Duplicado de Inputs (Semana 4)

#### 5.1 Migrar auth forms a `ui/TextField`

Archivos afectados:

| Archivo | Componente actual | Reemplazar con |
|---|---|---|
| `src/components/auth/SignInForm.tsx` | `form/input/InputField.tsx` | `ui/TextField.tsx` |
| `src/components/auth/SignUpForm.tsx` | `form/input/InputField.tsx` | `ui/TextField.tsx` |
| `src/components/auth/SignInForm.tsx` | `form/Label.tsx` | Prop `label` de TextField |
| `src/components/auth/SignUpForm.tsx` | `form/Label.tsx` | Prop `label` de TextField |

**Acción final:** Eliminar `src/components/form/` si no hay más dependencias.

---

## Resumen de Componentes a Crear

| Componente | Archivo | Propósito |
|---|---|---|
| `FormSection` | `src/components/ui/form/FormSection.tsx` | Sección con ícono, título y borde |
| `FormErrorBanner` | `src/components/ui/form/FormErrorBanner.tsx` | Banner de error con ícono y dismiss |
| `SubmitButton` | `src/components/ui/form/SubmitButton.tsx` | Botón submit con spinner automático |
| `FormModal` | `src/components/ui/form/FormModal.tsx` | Layout completo de modal con header/error/footer |
| `useFormValidation` | `src/hooks/useFormValidation.ts` | Hook de validación genérico para transición |
| `formClasses` | `src/utils/formClasses.ts` | Clases CSS centralizadas |

---

## Impacto Esperado

| Métrica | Antes | Después |
|---|---|---|
| Sistemas de validación | 3 | 1 (react-hook-form + zod) |
| Definiciones de `inputCls` | 7+ | 1 |
| Líneas de validación manual | ~700 | ~50 |
| Componentes de input duplicados | 2 | 1 |
| Tiempo para crear un nuevo modal | ~45 min | ~15 min |
| Errores de tipo en forms | Frecuentes (uso de `any`) | Eliminados (zod inference) |

---

## Prioridad Recomendada

1. **Fase 1** (infraestructura) — Base para todo lo demás, bajo riesgo, alto impacto inmediato
2. **Fase 3** (CSS centralizado) — Cambio mecánico, se puede hacer en paralelo con Fase 2
3. **Fase 2** (react-hook-form) — Impacto más alto pero requiere más cuidado
4. **Fase 4** (FormModal) — Depende de Fase 1 y 2
5. **Fase 5** (limpieza auth) — Bajo riesgo, se puede hacer en cualquier momento
