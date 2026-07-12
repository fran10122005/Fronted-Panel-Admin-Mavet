# Plan de Mejora — Módulo de Talleres

## Problemas detectados

1. **Tres tablas apiladas verticalmente** — Talleres Planificados, Alumnos Inscritos e Inventario compiten por atención en una sola página lineal.
2. **Menú contextual (3 puntitos) con manipulación manual del DOM** — Usa `getElementById`, `classList` y `style.position = 'fixed'` en vez de un dropdown declarativo.
3. **Sección "Alumnos Inscritos por Taller" redundante** — Es un accordion `<details>` que repite la misma información que el modal de Inscripciones.
4. **Sin separación por vistas** — Todo está en una sola pantalla con scroll excesivo.
5. **Botones de PDF sin contexto** — Están flotando en el header, no vinculados visualmente a su sección.
6. **Modal de Gestionar Instructores sobrecargado** — Tiene búsqueda + formulario + tabla, todo dentro de un modal.

## Propuesta: Navegación por pestañas (tabs)

Reemplazar la página lineal con 4 pestañas:

### Tab 1: Planificados
- Tabla de talleres planificados con buscador y filtro por instructor.
- Botones de acción **visibles** en cada fila (Asistencia, Inscribir, Editar, Eliminar) — sin menú de 3 puntos.
- Botón "Planificar Taller" + botón "PDF Planificación".
- Paginación.

### Tab 2: Inscripciones
- Tabla global de alumnos inscritos con buscador por nombre/cédula.
- Agrupación visual por taller (acordeón o filas agrupadas).
- Botones "Exportar PDF" y "Exportar Excel".
- Botón "Desinscribir" por fila.

### Tab 3: Inventario
- Catálogo maestro con buscador.
- Botones "Crear Taller", editar (lápiz) y eliminar (papelera).
- Botón "PDF Inventario".

### Tab 4: Instructores
- Tabla de instructores registrados.
- Formulario para crear nuevo (buscar por cédula + profesión + especialidad).
- Sin modal — contenido directo en la pestaña.

## Orden de implementación

1. Refactorizar el menú de 3 puntos por botones visibles con íconos.
2. Implementar tabs con estado local (`activeTab`).
3. Mover cada sección a su respectivo tab.
4. Extraer Gestionar Instructores a su propio tab.
5. Eliminar la sección redundante de "Alumnos Inscritos por Taller" (accordion) y unificarla en el tab de Inscripciones.
6. Probar y limpiar.
