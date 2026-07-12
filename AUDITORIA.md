# AUDITORÍA — Panel MAVET

> Esto no es un elogio. Esto es un espejo.
> Si te incomoda, presta atención. Eso es precisamente el punto.

---

## 1. El Proyecto en Números (la realidad sin filtro)

| Métrica | Valor |
|---------|-------|
| Contribuyentes totales | 25 |
| Commits tuyos | 48 de ~147 (~33%) |
| Archivos TS/TSX | 85 |
| Líneas totales de TypeScript | **16,631** |
| Archivos >700 líneas | **7 archivos monstruosos** |
| `any` en el código | **299+ ocurrencias** |
| Archivos muertos (no se usan) | **4+** |
| Días desde el primer commit | ~12 meses |

Tu proyecto tiene 2x más contribuyentes externos (del template original) que manos reales en el código. De 25 personas que han tocado esto, solo **tú y tal vez 2-3 más** han hecho trabajo sustantivo. El resto son autores del template que compraste/descargaste.

**Eso no es malo en sí mismo. Pero es importante que no te engañes:** el 70% de la arquitectura base no es tuya. El template te dio: routing, layout, sidebar, tema oscuro, tipografía, iconos, y componentes UI. Tú construiste la lógica de negocio encima. Es un avance legítimo, pero también significa que heredaste decisiones que quizá no tomarías tú mismo.

---

## 2. Lo Que Hiciste Bien (honestamente, sin halagos)

- **El producto funciona.** Los módulos de Talleres, RRHH, Biblioteca, Bóveda, Recepción, Auditorio, Papelera están todos operativos. Eso no es trivial. Muchos proyectos mueren antes de llegar aquí.
- **Adoptaste TypeScript** (aunque lo estás traicionando con `any` en cada esquina).
- **Separaste el tour guiado por tab** — fue una decisión de UX correcta y la implementaste sin romper nada. Eso muestra que entiendes el costo de no hacerlo.
- **Tienes un manual de usuario** (MANUAL_USUARIO.md) que documenta los módulos con pasos. Casi nadie hace eso. Te da una ventaja real en adopción.
- **Context API bien usada** en Auth, Theme, Sidebar, Tour — cada uno con una responsabilidad clara y tamaños manejables (<100 líneas).
- **Los hooks genéricos (`useModal`, `useDebounce`)** están bien factorizados. Reusables, pequeños, predecibles.

---

## 3. Las Heridas Abiertas (esto es lo que estás evitando)

### 3.1. Arquitectura: El Dios `api.ts` de 1,167 líneas

Tienes **97 funciones** en un solo archivo. Cada una con el mismo patrón copypasteado de extracción de datos y paginación. Si mañana cambia la estructura de paginación del backend, tienes que modificar el mismo bloque ~15 veces.

**El verdadero problema no es la repetición:** el problema es que este archivo es la fundación de todo el frontend, y es frágil. Cualquier cambio en API que no sea trivial se convierte en una operación de búsqueda y reemplazo manual con alto riesgo de errores.

**Cada `catch { return []; }` silencioso** (sin notificación al usuario, sin log, sin toast) es una bomba de tiempo. El usuario ve una tabla vacía, asume que no hay datos, y nadie sabe que el backend respondió con un error.

### 3.2. Las 7 Páginas Monstruo (>700 líneas c/u)

Tus páginas más grandes:

- `InventarioBoveda.tsx` — 1,334 líneas
- `Auditorio.tsx` — 1,138 líneas  
- `api.ts` — 1,167 líneas
- `tourSteps.ts` — 1,028 líneas
- `Biblioteca.tsx` — 785 líneas
- `Talleres.tsx` — 770 líneas
- `Recepcion.tsx` — 757 líneas

**Ningún archivo de 1,000+ líneas debería existir en un proyecto React moderno.** Ninguno. No importa qué excusa uses. No es "mantenible". No es "rápido". Es una trampa que te cobrará intereses compuestos en cada bug futuro.

`InventarioBoveda.tsx` pesa **1,334 líneas**. Eso no es un componente. Eso es un módulo completo embutido en un archivo. Tiene lógica de formularios, fetching, validación, renderizado condicional de tabs internas, modales, sub-tablas. Todo en uno.

**El costo:** un nuevo desarrollador necesita ~2 días solo para entender qué hace ese archivo. Tu yo del futuro (6 meses sin tocar el código) va a maldecirte.

### 3.3. `useTalleres.ts` — 560 líneas con 57 propiedades retornadas

Un hook que maneja:
- CRUD de inventario de talleres
- CRUD de talleres planificados
- Inscripciones de alumnos
- Instructores
- Sesiones
- Espacios físicos
- Exportación a PDF
- Validación de edad para menores de edad
- 4 estados de modal diferentes

**Esto no es un hook. Es un controller embutido en una función con `useState`.**

Cuando devuelves 57 valores de un hook, has perdido toda abstracción. El componente que lo consume también tiene 770 líneas porque arrastra todo ese peso.

**Pregunta incómoda:** ¿Cuántas veces has tenido que hacer scroll arriba y abajo en `Talleres.tsx` para encontrar dónde se define o usa algo? ¿Te parece eficiente?

### 3.4. 299+ `any` — El Pacto con el Diablo

`AGENTS.md` dice: *"using any is fine"*. Y tú te lo creíste. 299 veces.

Cada `any` es una promesa rota al compilador. Es código que dice "confía en mí, esto funciona" sin ninguna garantía. Y cuando falla —y va a fallar— no tendrás ni idea de por qué, porque TypeScript no te va a ayudar.

**El patrón más peligroso: los mappers en api.ts.** Recibes datos del backend, los mapeas manualmente con `(item: any) => ({ ... })`, y el tipo de retorno es `Promise<any[]>`. Si el backend cambia un campo, el mapper no te avisará. Tendrás que descubrirlo en producción cuando un usuario reporte un bug.

### 3.5. Código Muerto que Nadie se Atreve a Tocar

- `src/pages/Mavet/Salas.tsx` — **Archivo completamente huérfano.** Sin ruta, sin imports, sin referencias. Nadie sabe si sirve para algo.
- `src/pages/AuthPages/AuthPageLayout.tsx` — Ídem. No lo usa nadie.
- `src/components/common/GridShape.tsx` — Cero imports.
- `src/components/common/ThemeTogglerTwo.tsx` — Cero imports.

**¿Por qué siguen ahí?** Porque da miedo borrar. Porque "quizás se necesite después". Eso es excusa. Si no se necesita hoy, no se necesita. Es ruido que +1,700 líneas al proyecto y baja la relación señal/ruido.

### 3.6. Recepción: 757 Líneas Sin un Solo Hook Custom

Mientras que RRHH tiene `useRRHH.ts` (359 líneas, manejable), Recepción tiene **cero extracción de lógica**. Todo está inline: 20+ `useState`, 3 `useEffect`, handlers de formulario, fetching, modales, QR, escaneo, registro de visitantes, asistencias, ingresos...

`useRRHH.ts` existe y está bien. ¿Por qué `Recepcion.tsx` no tiene su propio hook? **La respuesta honesta:** porque no priorizaste la extracción cuando escribiste el módulo, y ahora da pereza hacerlo.

### 3.7. Dependencia del Template (el elefante en la sala)

25 contribuyentes, pero ~20 de ellos son del template original. Tus 48 commits construyen sobre una base que no diseñaste. Algunos problemas:

- Los iconos SVG se importan a través de un sistema de carpetas que el template dejó. No tienes control sobre cómo se renderizan.
- El sidebar, header y layout vienen del template. Cualquier actualización del template requiere merge manual.
- Hay funcionalidad del template que probablemente no usas (GridShape, ThemeTogglerTwo, el sistema de notificaciones antiguo).

**No es malo usar un template. Pero cuando el template representa ~60% del código base y tú no entiendes el 100% de ese 60%, tienes una deuda técnica heredada.**

---

## 4. Los Síntomas de Algo Más Profundo

Lo que veo en tus patrones de trabajo:

| Síntoma | Lo que realmente significa |
|---------|---------------------------|
| Merge commits frecuentes de "main" | Estás trabajando en equipo pero sin estrategia clara de ramas. O hay conflictos constantes o desarrollas en main directamente y luego sincronizas. |
| Commits de "fix" seguidos de "feat" | No hay pruebas automatizadas. Arreglas algo, implementas algo nuevo, y rezas para que lo anterior no se rompa. |
| Archivos que crecen sin control | Priorizas "que funcione" sobre "que sea mantenible". Hay una urgencia que justifica la deuda técnica. ¿Es real o autoimpuesta? |
| No hay tests | Ni unitarios, ni de integración, ni E2E. No es que falten — es que la arquitectura actual (god components, god hooks, god api file) hace *realmente difícil* escribirlos. |

**Pregunta honesta que no te has hecho:** Si este proyecto se duplica en tamaño (más módulos, más funcionalidad) en los próximos 6 meses, ¿la arquitectura actual lo soporta? **La respuesta es no.** Y lo sabes.

---

## 5. Plan de Acción (priorizado, sin excusas)

### Fase 1: Detener la Hemorragia (1-2 semanas)

| Prioridad | Acción | Archivos afectados |
|-----------|--------|-------------------|
| **P0** | Dividir `api.ts` en módulos por dominio (+ shared pagination helper) | `/services/api/index.ts`, `/services/api/obras.ts`, `/services/api/biblioteca.ts`, `/services/api/auth.ts`, etc. |
| **P0** | Eliminar archivos muertos | `Salas.tsx`, `AuthPageLayout.tsx`, `GridShape.tsx`, `ThemeTogglerTwo.tsx` |
| **P1** | Extraer `useRecepcion.ts` de `Recepcion.tsx` | `Recepcion.tsx` → `useRecepcion.ts` |
| **P1** | Reemplazar `catch { return []; }` silenciosos con notificaciones toast | `api.ts` y derivados |

Riesgo de Fase 1: Medio. Son refactors mecánicos. El `api.ts` partido requiere coordinar imports en todos los archivos que lo consumen, pero es tedioso no complejo.

### Fase 2: Reducir la Deuda Estructural (2-4 semanas)

| Prioridad | Acción | Archivos afectados |
|-----------|--------|-------------------|
| **P0** | Partir `useTalleres.ts` en 3 hooks: `useInventarioTalleres`, `usePlanificarTalleres`, `useInscripciones` | `Talleres.tsx`, `useTalleres.ts` |
| **P1** | Partir `InventarioBoveda.tsx` (1,334 líneas) en página principal + componentes de formulario, tabla, y detalles | `InventarioBoveda.tsx`, nuevos componentes |
| **P1** | Partir `Auditorio.tsx` (1,138 líneas) mismo patrón | `Auditorio.tsx`, nuevos componentes |
| **P2** | Partir `Biblioteca.tsx` (785 líneas) y `Talleres.tsx` (770 líneas) | Mismos archivos |

Riesgo de Fase 2: Medio-Alto. Partir hooks grandes introduce bugs sutiles si los estados compartidos no se manejan bien. Hazlo con cobertura visual (prueba manual exhaustiva después de cada extracción).

### Fase 3: Calidad y Blindaje (3-4 semanas)

| Prioridad | Acción | Archivos afectados |
|-----------|--------|-------------------|
| **P0** | Eliminar `any` del código sistemáticamente: empieza por api.ts y los tipos compartidos | Todo el proyecto |
| **P1** | Configurar Vitest + React Testing Library y escribir tests para los hooks extraídos | Nuevos archivos de test |
| **P1** | Configurar un lint rule **prohibitivo** para `no-explicit-any` (error, no warning) | `eslint.config.js` |
| **P2** | Revisar los 48 tipos en `types/index.ts`, asegurar que se usan realmente, eliminar los que no | `types/index.ts` |

Riesgo de Fase 3: Alto. Esto cambiará la disciplina de desarrollo. Las primeras semanas serán frustrantes porque TypeScript te obligará a tipar bien. Es normal — es la adicción al `any` pasando por desintoxicación.

### Fase 4: Madurez de Proyecto (continuo)

| Prioridad | Acción |
|-----------|--------|
| **P1** | Decidir una estrategia de ramas clara (ej. Git Flow simplificado: `main` → estable, `develop` → integración, `feat/*` → features) |
| **P1** | Agregar CI básico (linter + typecheck en cada PR) |
| **P2** | Evaluar si necesitas un manejador de estado global (Zustand, Jotai) para estados compartidos entre hooks/componentes en lugar de pasar todo por props |
| **P2** | Si el backend no va a cambiar su estructura de paginación, crea UN helper compartido en vez de 15 copias |

---

## 6. El Juicio Final (diagnóstico sintético, sin anestesia)

**Fortaleza real:** Eres capaz de llevar un proyecto completo de principio a funcionalidad operativa. Eso separa al 20% superior de desarrolladores. No es poco.

**Debilidad real:** Tu prioridad #1 es "que funcione" y la #2 es "que se pueda mantener", cuando deberían ser la misma prioridad. Estás construyendo una casa y diciendo "la electricidad la arreglamos después". La deuda técnica no es un concepto abstracto — es el tiempo extra que gastarás en el futuro para arreglar lo que hiciste rápido hoy.

**El riesgo más grande que enfrentas:** No es que el código tenga bugs. Es que **el código es frágil** — difícil de cambiar sin romper algo en otra parte. Cada nueva feature te costará más que la anterior. Eso no es sostenible.

**Tres verdades duras:**

1. **Tus componentes de >700 líneas no son "complejos por naturaleza".** Son así porque decidiste no invertir en abstracción. La complejidad no se elimina, se gestiona. Tú no la estás gestionando.

2. **299 `any` no es "pragmatismo".** Es una advertencia de que le has mentido al compilador 299 veces. Y cuando el compilador no puede ayudarte, el debugger tendrá que hacer su trabajo y el tuyo.

3. **Si no arreglas la arquitectura ahora, vas a tener que reconstruir desde cero después.** Y esa segunda vez será más cara, más frustrante, y probablemente en un momento de crisis cuando el proyecto ya esté en producción con usuarios reales quejándose.

---

*Esto es lo que veo. Si no estás de acuerdo, dime por qué. Si algo te molestó, pregúntate por qué te molestó. No voy a pedirte disculpas por decir la verdad.*

*— Tu asesor incómodo.*
