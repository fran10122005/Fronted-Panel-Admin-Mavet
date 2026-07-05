# Plan de Implementación — Auditorio (Gestión de Reservas)

## 1. Optimización de reportes PDF

**Archivo a modificar:** `src/services/pdf.service.ts`

**Problema:** El endpoint `/api/reportes/eventos` genera el PDF completamente del lado del servidor y puede devolver páginas vacías.

**Cambio:** Actualmente la función `exportarHistorialEventos` (línea 211-220) recibe `_eventos` como parámetro pero no lo usa — delega todo al backend. Para evitar hojas vacías:

1. Pasar los datos reales de `events` (ya disponibles en el frontend) al PDF en vez de depender únicamente del backend.
2. Si se mantiene la generación server-side, el backend debe corregir la paginación. Si se pasa a client-side, implementar paginación con `jsPDF` + `jspdf-autotable` (ya disponibles en el proyecto).
3. Agregar un `autoSize: true` o similar para que las tablas no generen páginas en blanco.

**Criterio de aceptación:** Al exportar el historial de eventos, el PDF solo imprime las páginas necesarias con contenido real. No hay páginas en blanco.

---

## 2. Visualización de código de reserva

**Archivo a modificar:** `src/pages/Mavet/Auditorio.tsx`

**Problema:** El código de reserva (`codigoReserva`) se genera pero solo se muestra como un campo read-only en el formulario. El usuario no lo ve antes de guardar.

**Cambio:** El código ya se genera en `handleDateSelect` (líneas 131-136) y se muestra como input read-only (líneas 578-586). Verificar que:

1. `codigoReserva` se genere en el momento en que se abre el modal de nueva reserva (actualmente se genera en `handleDateSelect`, que es el callback del calendario al hacer click en una fecha). Si el modal se abre de otra forma, hay que generar el código también ahí.
2. El código sea visible y legible en el formulario.
3. Se incluya en el payload de creación (ya se hace en línea 250).

**Criterio de aceptación:** Al abrir el formulario de nueva reserva, el código de reserva (ej. `RES-001`) se muestra automáticamente en el campo correspondiente.

---

## 3. Nueva categoría "Otros"

**Archivo a modificar:** `src/pages/Mavet/Auditorio.tsx`

**Referencia:** `src/pages/Mavet/InventarioBoveda.tsx` (líneas 764-801) — patrón "Otra (especificar)..."

**Cambio:**

1. Agregar un estado `customTipoEvento: string` para el valor personalizado.
2. En el `<select>` de tipo de evento (líneas 613-627), agregar:
   ```tsx
   <option value="other">Otros (especificar)...</option>
   ```
3. Cuando `tipoEvento === "other"`, mostrar un `<input>` de texto libre en lugar del `<select>`.
4. En el payload (línea 254), si `tipoEvento === "other"`, enviar `customTipoEvento` en lugar de `"other"`.
5. En `resetModalFields()` (línea 317), resetear también `customTipoEvento`.
6. Opcional: botón "Volver a seleccionar tipo" como en Bóveda.

**Criterio de aceptación:** El selector de tipo de evento tiene una opción "Otros (especificar)..." que al seleccionarla muestra un campo de texto para escribir un tipo personalizado.

---

## 4. Borrado lógico (soft delete) y alertas

### 4a. Soft delete

**Archivo a modificar:** `src/pages/Mavet/Auditorio.tsx` y opcionalmente `src/services/api.ts`

**Cambio:**

1. Actualmente `eliminarReservaAuditorio` (api.ts línea 884) hace un `DELETE` directo. Cambiarlo para que llame a un endpoint de soft delete del backend (ej. `PUT /api/educacion/solicitudes-espacio/${id}/soft-delete` o enviar `{ deleted_at: new Date() }`).
2. En `Auditorio.tsx`, el botón de eliminar (modal) debe confirmar con un diálogo y luego llamar al soft delete.
3. Las reservas eliminadas (soft deleted) no deben aparecer en el calendario ni en las listas. El backend debe filtrar por `deleted_at IS NULL`.

**Nota:** Esto depende del backend. Si el backend no tiene soft delete implementado, hay que agregarlo allá primero.

### 4b. Alerta al Administrador

**Cambio:** Después de eliminar una reserva, enviar una notificación al rol Administrador. Esto puede hacerse mediante:

- Una llamada API a un endpoint de notificaciones (si existe)
- O un toast en el frontend indicando que la eliminación fue exitosa
- Idealmente: el backend debería emitir la notificación automáticamente

**Criterio de aceptación:** Al eliminar una reserva, los datos no se pierden permanentemente (soft delete) y el administrador recibe una notificación de la acción.

---

## 5. Bloqueo de botón Guardar

**Archivo a modificar:** `src/pages/Mavet/Auditorio.tsx`

**Cambio:**

1. Calcular un `isFormValid` derivado de los campos obligatorios:
   ```tsx
   const isFormValid = useMemo(() => {
     return (
       eventTitle.trim() !== "" &&
       tipoEvento !== "" &&
       eventDate !== "" &&
       cedulaOrganizador.trim() !== "" &&
       organizador.trim() !== "" &&
       horaInicio !== "" &&
       horaFin !== "" &&
       horaInicio < horaFin &&
       new Date(eventDate + "T00:00:00") >= new Date(new Date().toDateString())
     );
   }, [eventTitle, tipoEvento, eventDate, cedulaOrganizador, organizador, horaInicio, horaFin]);
   ```
2. Cambiar `disabled={saving}` en el botón Guardar (línea 768) por `disabled={saving || !isFormValid}`.
3. Opcional: agregar estilos visuales para indicar campos inválidos (borde rojo, tooltip, etc.).

**Criterio de aceptación:** El botón "Guardar Reserva" permanece deshabilitado hasta que todos los campos obligatorios estén completos y las validaciones se cumplan.

---

## 6. Auditoría de códigos de sala

**Archivos a modificar:** Depende de la implementación (probablemente backend + frontend)

**Problema:** Algunas salas en la tabla `espacios_museo` no tienen código único.

**Cambio:**

1. **Backend:** Identificar las salas sin código y asignarles uno único (ej. `SALA-001`, `SALA-002`, etc.).
2. **Frontend (opcional):** Mostrar el código de sala en la interfaz de Salas y en el formulario de reserva de Auditorio.
3. Validar que el `id_espacio: 1` hardcodeado corresponda al código de sala correcto, o mejor, permitir seleccionar la sala desde un listado dinámico.

**Criterio de aceptación:** Cada sala en la base de datos tiene un código único de identificación. El formulario de reserva de auditorio puede referenciar la sala correcta por su código.

---

## Resumen de archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/Mavet/Auditorio.tsx` | Items 2, 3, 4, 5 |
| `src/services/api.ts` | Items 1, 4 |
| `src/services/pdf.service.ts` | Item 1 |
| `src/types/index.ts` | Item 4 (opcional: agregar `eliminado` a `EventoAuditorio`) |
| Backend | Items 1, 4, 6 |
