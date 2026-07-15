# PLAN DE CUMPLIMIENTO LEGAL — MAVET
## Museo de Artes Visuales y del Espacio del Táchira

**Versión:** 1.0 — Julio 2026  
**Ámbito:** Sistema de Administración MAVET (Frontend + Backend)  
**Tipo de entidad:** Museo público estadal (Estado Táchira, Venezuela)

---

## ÍNDICE

1. [Marco Jurídico Venezolano Aplicable](#1-marco-jurídico-venezolano-aplicable)
2. [Análisis por Área del Sistema](#2-análisis-por-área-del-sistema)
3. [Matriz de Riesgo Legal](#3-matriz-de-riesgo-legal)
4. [Plan de Implementación Priorizado](#4-plan-de-implementación-priorizado)
5. [Requerimientos Transversales](#5-requerimientos-transversales)
6. [Anexo: Checklist de Verificación](#6-anexo-checklist-de-verificación)

---

## 1. MARCO JURÍDICO VENEZOLANO APLICABLE

### 1.1 Leyes fundamentales del sistema

| # | Ley | Gaceta Oficial | Aplicación al sistema MAVET | Prioridad |
|---|-----|----------------|-----------------------------|-----------|
| **L1** | **Constitución de la República Bolivariana de Venezuela (CRBV)** | G.O. N° 5.453 Ext. 24/03/2000 | Arte. 98-100 (cultura), 141 (administración pública), 143 (acceso a información), 51 (petición), 62 (participación ciudadana) | Crítica |
| **L2** | **Ley Orgánica de la Administración Pública (LOAP)** | G.O. N° 6.147 Ext. 17/09/2014 | Principios de legalidad, eficacia, eficiencia, transparencia, rendición de cuentas. Arts. 12-25 (principios generales) | Crítica |
| **L3** | **Ley Orgánica de Procedimientos Administrativos (LOPA)** | G.O. N° 2.818 Ext. 01/07/1981 | Derecho de petición (Art. 2), formación de expedientes, plazos (Art. 60: 4 meses), notificaciones, recursos administrativos | Crítica |
| **L4** | **Ley de Infogobierno** | G.O. N° 40.274 17/10/2013 | Software libre y estándares abiertos (Art. 34), interoperabilidad (Art. 18-19), accesibilidad (Art. 14), seguridad de la información (Art. 25-28) | **Alta** |
| **L5** | **Ley Orgánica para la Celeridad y Optimización de Trámites Administrativos (LOPCYOTA)** | G.O. N° 7.018 Ext. 08/04/2026 | Simplificación de trámites, digitalización obligatoria, interoperabilidad, reducción de plazos. Derogatoria tácita de disposiciones incompatibles de la LSTA | **Alta** |
| **L6** | **Ley de Protección y Defensa del Patrimonio Cultural** | G.O. N° 4.623 Ext. 03/09/1993 | Gestión de colecciones (Arts. 6, 26-27), inventario de bienes culturales, custodia, conservación, restauración | **Alta** |
| **L7** | **Ley del Estatuto de la Función Pública** | G.O. N° 37.522 06/09/2002 | Registro de personal (Art. 17-18), deberes (Art. 33), control de asistencia (Art. 34), régimen disciplinario (Arts. 69-74) | **Alta** |
| **L8** | **Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT)** | G.O. N° 6.076 Ext. 07/05/2012 | Jornada laboral (Arts. 167-195), control de horas (Art. 177), registro de trabajadores (Art. 36), condiciones de trabajo | **Alta** |
| **L9** | **Ley Contra la Corrupción (reforma 2022)** | G.O. N° 6.703 Ext. 02/05/2022 | Registro de operaciones (Art. 24-26), transparencia activa, rendición de cuentas | **Alta** |
| **L10** | **Ley Orgánica de la Contraloría General de la República** | G.O. N° 6.023 Ext. 28/12/2011 | Control fiscal, pistas de auditoría (Art. 36-40), declaraciones juradas | Alta |
| **L11** | **Ley de Archivos Nacionales** | G.O. N° 37.620 31/01/2003 | Gestión documental, conservación de expedientes, tablas de retención | Media |
| **L12** | **Ley de Derecho de Autor** | G.O. N° 4.638 Ext. 01/10/1993 | Propiedad intelectual de obras artísticas, reproducción, cesión de derechos | Media |
| **L13** | **Ley de Protección de Datos Personales (Proyecto)** | En discusión | Principios de consentimiento, finalidad, lealtad — aunque no hay ley orgánica vigente, aplicar estándares internacionales | Media |
| **L14** | **Ley de Simplificación de Trámites Administrativos (LSTA)** | G.O. N° 39.951 25/06/2012 | Supletoria a LOPCYOTA. Principios de simplificación, ventanilla única | Media |
| **L15** | **Ley Orgánica del Poder Público Municipal** | G.O. N° 6.015 Ext. 28/12/2011 | Aplicable si el museo es municipal; el Museo de Arte del Táchira es estadal, pero aplica supletoriamente | Baja |
| **L16** | **Ley Orgánica de la Administración Financiera del Sector Público** | G.O. N° 6.210 Ext. 30/12/2015 | Presupuesto, contabilidad pública, control de ingresos | Media |
| **L17** | **Ley de Protección y Defensa del Patrimonio Cultural (Reglamentos)** | Varios | Normas técnicas de conservación, catalogación, registro de obras patrimoniales | Alta |

### 1.2 Instrumentos internacionales aplicables

- **Convención sobre la Protección del Patrimonio Mundial, Cultural y Natural (UNESCO 1972)**
- **Convención sobre los Medios para Prohibir y Prevenir la Importación, Exportación y Transferencia Ilícitas de Bienes Culturales (UNESCO 1970)**
- **Convención para la Salvaguardia del Patrimonio Cultural Inmaterial (UNESCO 2003)**
- **Código de Deontología del ICOM para Museos** (Arts. 1.6, 2.21: protección de colecciones contra desastres)
- **Convención Americana sobre Derechos Humanos (Pacto de San José)** — Arts. 13 (libertad de expresión), 21 (propiedad), 23 (derechos políticos)
- **Declaración Americana de los Derechos y Deberes del Hombre** — Art. IV (derecho de acceso a la información)

---

## 2. ANÁLISIS POR ÁREA DEL SISTEMA

### 2.1 INVENTARIO DE OBRAS / BÓVEDA (`InventarioBoveda.tsx`)

**Base legal:** L6 (Patrimonio Cultural), L4 (Infogobierno), L12 (Derecho de Autor)

| Requisito legal | Estado actual | Brecha |
|----------------|---------------|--------|
| **Registro único de bienes culturales** (L6 Art. 6, numeral 3) | ✅ Existe catálogo con código, título, artista, medidas, técnica, categoría, ubicación, imágenes | Parcial — falta campo "estado de conservación" detallado (L6 Art. 26), valoración patrimonial, y número de registro IPC |
| **Trazabilidad de movimientos** (L6 Art. 26-27) | ❌ No hay registro de cambios de ubicación ni de custodia | Crítica — se requiere historial de movimientos de cada obra |
| **Control de restauraciones** (L6 Art. 26) | ❌ Solo hay campo de "estado" (bueno/malo/regular) sin detalle de intervenciones | Crítica — se necesita registro de intervenciones, restaurador responsable, fecha, técnicas aplicadas |
| **Imágenes de alta resolución** | ✅ Implementa subida de imágenes con compresión WebP | Mejorable — metadata EXIF, watermark de identificación |
| **Categorización patrimonial** | ❌ No hay clasificación por valor patrimonial (BIC, monumento nacional, etc.) | Alta — el Art. 6 L6 exige clasificación |
| **Código de inventario único** | ✅ Implementa códigos `OBR-XXX` | Aceptable — verificar que cumpla con estándares del IPC |
| **Registro de artistas** | ✅ CRUD completo con búsqueda | Bueno — alineado con gestión de creadores |
| **Control de exportación/salida** (L6 Art. 41) | ❌ No existe funcionalidad de control de salidas temporales | Alta — necesario para préstamos, exhibiciones externas |

**Acciones prioritarias:**
1. Añadir historial completo de movimientos y custodios
2. Añadir módulo de registro de intervenciones/restauraciones
3. Implementar clasificación patrimonial según IPC
4. Implementar control de salidas temporales y autorizaciones
5. Añadir metadata de preservación digital a imágenes

---

### 2.2 RECURSOS HUMANOS (`RRHH.tsx`)

**Base legal:** L7 (Estatuto Función Pública), L8 (LOTTT), L9 (Contra la Corrupción)

| Requisito legal | Estado actual | Brecha |
|----------------|---------------|--------|
| **Registro de funcionarios públicos** (L7 Art. 17-18) | ✅ CRUD completo de trabajadores con datos personales, cargo, estado | Bueno — verificar inclusión de datos de ingreso a la administración pública |
| **Control de asistencia y jornada** (L8 Art. 177) | ✅ Registro de entrada/salida por QR, horas cumplidas, resumen semanal | Bueno — alineado con LOTTT |
| **Horas semanales y cumplimiento** (L7 Art. 34) | ✅ Cálculo de horas semanales, acumuladas, restantes, justificaciones | Bueno — verificar topes legales (LOTTT Art. 173: 40h semanales) |
| **Justificación de inasistencias** (L7 Art. 34) | ✅ Modal de justificación con motivo y soporte | Bueno — verificar plazos legales |
| **Expediente del funcionario** (L7 Art. 21) | ❌ No hay repositorio de documentos del trabajador (contrato, títulos, evaluaciones) | **Alta** — la ley exige expediente actualizado |
| **Evaluación de desempeño** (L7 Art. 30-32) | ❌ No implementada | Media — obligatorio para funcionarios de carrera |
| **Régimen disciplinario** (L7 Art. 69-74) | ❌ No hay registro de sanciones, amonestaciones ni procedimientos | Alta — obligatorio por L7 |
| **Registro de usuarios del sistema** | ✅ CRUD de usuarios con roles | Bueno — pero falta vinculación explícita con cargos de la función pública |
| **Cargos y manual descriptivo** (L7 Art. 17) | ✅ CRUD de cargos | Mejorable — sin manual descriptivo de clases de cargos (exigido por Art. 17 L7) |
| **Control de vacaciones y permisos** (L7 Art. 25, L8 Art. 190-195) | ❌ No implementado | Alta — derecho irrenunciable del funcionario |
| **Cumplimiento de cuotas de inclusión laboral** (Ley de Discapacidad) | ❌ No hay campo ni control | Media |

**Acciones prioritarias:**
1. Implementar expediente digital del funcionario (subida de documentos)
2. Implementar módulo de vacaciones, permisos y licencias
3. Implementar registro de sanciones y procedimientos disciplinarios
4. Añadir registro de evaluaciones de desempeño por período
5. Añadir control de cuotas de inclusión laboral (Ley de Discapacidad)

---

### 2.3 BIBLIOTECA (`Biblioteca.tsx`)

**Base legal:** L6 (Patrimonio Cultural Art. 6 numeral 8), L11 (Archivos Nacionales)

| Requisito legal | Estado actual | Brecha |
|----------------|---------------|--------|
| **Registro del patrimonio bibliográfico** (L6 Art. 6 numeral 8) | ✅ CRUD de libros con autor, categoría, cantidad, estante | Bueno |
| **Control de consultas en sala** (L11) | ✅ Registro de préstamos en sala con datos del solicitante, hora, estado | Bueno |
| **Estadísticas de uso** | ✅ Consultas más frecuentes, top lectores, totales diarios/semanales/mensuales | Bueno |
| **Fondo antiguo o valioso** | ❌ No hay categorización especial para material bibliográfico patrimonial | Media |
| **Plan de conservación documental** (L11) | ❌ No hay registro de condiciones ambientales ni estado de conservación de libros | Media |
| **Catálogo público** | ❌ No hay OPAC (catálogo en línea accesible al público) | Baja — recomendable |

**Acciones prioritarias:**
1. Añadir campo de valor patrimonial al libro (fondo antiguo, colección especial, etc.) — L6 Art. 6.8
2. Implementar registro de condiciones de conservación — L11
3. Añadir generación de actas de expurgo/baja de material bibliográfico

---

### 2.4 RECEPCIÓN E INGRESOS (`Recepcion.tsx`, `Ingresos.tsx`, `RegistroPublico.tsx`)

**Base legal:** L3 (LOPA), L5 (LOPCYOTA), L9 (Contra la Corrupción)

| Requisito legal | Estado actual | Brecha |
|----------------|---------------|--------|
| **Registro de visitantes** | ✅ Check-in por cédula, registro de datos, motivo de visita, menores de edad | Bueno |
| **Autoservicio público** (L5 LOPCYOTA) | ✅ Registro público sin autenticación con wizard de 3 pasos | Bueno — alineado con simplificación de trámites |
| **Estadísticas de visitantes** | ✅ Dashboard con visitas hoy, únicos, totales, por motivo, top visitantes | Bueno |
| **Protección de datos personales** | ❌ No hay aviso de privacidad, consentimiento ni política de tratamiento de datos | **Alta** |
| **Constancia de registro** (L5 LOPCYOTA Art. 18) | ❌ No se entrega comprobante digital del registro al visitante | Alta |
| **Agenda del día visible** | ✅ Agenda de eventos del día mostrada al público | Bueno |
| **QR para ingreso** | ✅ QR generado para el visitante | Bueno |
| **Control de aforo** | ❌ No hay control de capacidad máxima simultánea | Media |

**Acciones prioritarias:**
1. Implementar aviso de privacidad y consentimiento explícito al registrar visitantes
2. Generar comprobante digital de registro (PDF o código) — L5 LOPCYOTA
3. Implementar control de aforo (LOPCYMAT, seguridad)

---

### 2.5 AUDITORIO Y SALAS (`Auditorio.tsx`, `Salas.tsx`)

**Base legal:** L3 (LOPA), L5 (LOPCYOTA)

| Requisito legal | Estado actual | Brecha |
|----------------|---------------|--------|
| **Registro de reservas** | ✅ CRUD completo con validaciones, calendario, código de reserva | Bueno |
| **Tipos de evento** | ✅ Tipos predefinidos + opción "Otros" con texto libre | Bueno |
| **Control de espacios** | ✅ CRUD de salas con código, capacidad (máx. 80), descripción | Bueno |
| **Código único de sala** | ✅ Códigos `EMU-XXX`, verificación de unicidad | Bueno |
| **Constancia de solicitud** (L5 LOPCYOTA) | ❌ No se genera constancia digital de la solicitud de espacio | Media |
| **Notificación de aprobación/rechazo** (LOPA Art. 60) | ❌ No hay flujo de aprobación formal — la reserva se crea directamente | **Alta** |
| **Procedimiento administrativo formal** (LOPA) | ❌ No hay número de expediente asociado a cada solicitud | Alta |
| **Historial de cambios** | ❌ No hay trazabilidad de modificaciones a las reservas | Media |

**Acciones prioritarias:**
1. Implementar flujo de solicitud → aprobación/rechazo con número de expediente (LOPA)
2. Generar constancia digital de la solicitud recibida
3. Implementar registro de trazabilidad de cambios en las reservas
4. Añadir notificación al solicitante del resultado

---

### 2.6 TALLERES Y EDUCACIÓN (`Talleres.tsx`, `Educacion.tsx`)

**Base legal:** L3 (LOPA), L7 (Función Pública), L5 (LOPCYOTA)

| Requisito legal | Estado actual | Brecha |
|----------------|---------------|--------|
| **Registro de talleres** | ✅ CRUD completo con fechas, instructores, espacios | Bueno |
| **Inscripciones de participantes** | ✅ Inscripción con datos del alumno y representante (menores) | Bueno |
| **Sesiones y asistencia** | ✅ Control de sesiones, asistencia, métricas | Bueno |
| **Instructores** | ✅ CRUD con búsqueda por cédula y datos profesionales | Bueno |
| **Inventario de talleres** | ✅ CRUD de inventario de materiales | Bueno |
| **Constancia de inscripción** (L5 LOPCYOTA) | ❌ No se genera constancia digital de inscripción al taller | Media |
| **Certificación o constancia de participación** | ❌ No hay emisión de constancias/certificados automáticos | Media |
| **Protección de datos de menores** (LOPNNA) | ❌ No hay consentimiento explícito para datos de niños/representantes | **Alta** |

**Acciones prioritarias:**
1. Generar constancia digital de inscripción (L5 LOPCYOTA)
2. Implementar consentimiento informado para datos de menores (LOPNNA Art. 32-37)
3. Implementar emisión automatizada de constancias de participación/certificados
4. Añadir registro de notificaciones a representantes

---

### 2.7 PAPELERA (ELIMINACIÓN DE DATOS)

**Base legal:** L11 (Archivos Nacionales)

| Requisito legal | Estado actual | Brecha |
|----------------|---------------|--------|
| **Eliminación lógica (soft delete)** | ✅ Implementado para todos los módulos | Bueno |
| **Período de retención** | ✅ 30 días antes de eliminación automática | Bueno — verificar si cumple con tablas de retención documental |
| **Restauración de datos** | ✅ Restaurar desde papelera | Bueno |
| **Eliminación permanente** | ✅ Eliminación definitiva con registro | Bueno |
| **Registro de auditoría de eliminación** | ❌ No hay bitácora de quién eliminó, cuándo y por qué | **Alta** — L11, L9 |
| **Tabla de retención documental ** (L11) | ❌ No existe configuración de plazos de retención por tipo documental | Alta |

**Acciones prioritarias:**
1. Implementar bitácora de eliminación (usuario, fecha, motivo, tipo de documento)
2. Configurar tablas de retención documental por tipo (L11)
3. Añadir exportación de registro de eliminaciones para la Contraloría (L9)

---

### 2.8 AUTENTICACIÓN Y CONTROL DE ACCESO

**Base legal:** L4 (Infogobierno), L9 (Contra la Corrupción)

| Requisito legal | Estado actual | Brecha |
|----------------|---------------|--------|
| **Autenticación de usuarios** | ✅ JWT en localStorage con interceptor axios | **⚠️ Crítica** — localStorage es vulnerable a XSS. L4 Art. 25-28 exige seguridad |
| **Roles y permisos** | ✅ Roles por módulo con `RoleProtectedRoute` | Bueno |
| **Cierre de sesión automático** | ❌ No hay timeout de sesión por inactividad | **Alta** — L4 Art. 26 |
| **Registro de acceso (auditoría)** | ❌ No hay bitácora de inicio/cierre de sesión | **Alta** — L9 Arts. 24-26 |
| **Política de contraseñas** | ❌ No hay validación de fortaleza de contraseñas en frontend | Alta — L4 |
| **Doble factor de autenticación** | ❌ No implementado | Media — recomendable |
| **Registro de intentos fallidos** | ❌ No hay control de bloqueo por intentos | Alta — seguridad |

**Acciones prioritarias:**
1. **URGENTE**: Migrar de localStorage a cookies HttpOnly + Secure para el token JWT
2. Implementar timeout de sesión por inactividad (15-30 min recomendado)
3. Implementar bitácora de accesos (quién, cuándo, desde dónde, qué acciones)
4. Implementar política de contraseñas (longitud mínima, caracteres especiales, expiración)
5. Implementar bloqueo por intentos fallidos de inicio de sesión

---

## 3. MATRIZ DE RIESGO LEGAL

| ID | Riesgo | Base Legal | Probabilidad | Impacto | Nivel | Módulo |
|----|--------|-----------|-------------|---------|-------|--------|
| **R01** | Token JWT en localStorage (vulnerable a XSS) | L4 Art. 25-28 | Alta | Crítico | **🚨 Crítico** | Auth |
| **R02** | Ausencia de bitácora de auditoría de accesos | L9 Arts. 24-26 | Alta | Crítico | **🚨 Crítico** | Transversal |
| **R03** | Ausencia de expediente digital del funcionario | L7 Art. 21 | Alta | Alto | **🔴 Alto** | RRHH |
| **R04** | Sin historial de movimientos de obras | L6 Arts. 26-27 | Alta | Alto | **🔴 Alto** | Inventario |
| **R05** | Sin registro de restauraciones/intervenciones | L6 Art. 26 | Media | Alto | **🔴 Alto** | Inventario |
| **R06** | Sin flujo de aprobación de reservas (acto administrativo) | LOPA Art. 60 | Alta | Alto | **🔴 Alto** | Auditorio |
| **R07** | Sin aviso de privacidad ni consentimiento de datos | L5, LOPNNA | Alta | Alto | **🔴 Alto** | Recepción |
| **R08** | Sin control de vacaciones y permisos | L7 Art. 25 | Media | Alto | **🟡 Medio** | RRHH |
| **R09** | Sin registro de sanciones disciplinarias | L7 Arts. 69-74 | Media | Alto | **🟡 Medio** | RRHH |
| **R10** | Sin timeout de sesión por inactividad | L4 Art. 26 | Alta | Medio | **🟡 Medio** | Auth |
| **R11** | Sin política de contraseñas | L4 | Alta | Medio | **🟡 Medio** | Auth |
| **R12** | Sin comprobante digital de trámites | L5 LOPCYOTA Art. 18 | Alta | Medio | **🟡 Medio** | Recepción, Talleres, Auditorio |
| **R13** | Software privativo (React/Node/TypeScript no son software libre) | L4 Art. 34 | **Determinante** | Alto | **⚠️ Estructural** | Transversal |
| **R14** | Sin tabla de retención documental ni gestión documental | L11 | Media | Medio | **🟡 Medio** | Papelera |
| **R15** | Sin registro de eliminaciones (bitácora) | L11, L9 | Media | Medio | **🟡 Medio** | Papelera |

> **Nota sobre R13 (Software Libre):** La Ley de Infogobierno Art. 34 establece que todo software en la Administración Pública debe ser **software libre con estándares abiertos**. El stack actual (React, Node.js, TypeScript, Vite) son tecnologías de **código abierto pero no necesariamente software libre** según la definición de la ley venezolana. Se requiere una evaluación del ente competente (CNTI) para determinar si aplica excepción (Art. 66) o si se requiere migración.

---

## 4. PLAN DE IMPLEMENTACIÓN PRIORIZADO

### FASE 0 — INMEDIATA (Semana 1-2) — Riesgos críticos

| # | Acción | Módulo | Esfuerzo | Dependencias |
|---|--------|--------|----------|-------------|
| 0.1 | Migrar JWT de localStorage a cookie HttpOnly (cambio en backend + frontend) | Auth + Backend | 3 días | Backend debe enviar cookie |
| 0.2 | Implementar bitácora de accesos (login/logout/acciones críticas) | Transversal | 3 días | Backend endpoint de auditoría |
| 0.3 | Implementar timeout de sesión por inactividad | Auth | 1 día | — |
| 0.4 | Implementar política de contraseñas y bloqueo por intentos fallidos | Auth + Backend | 2 días | Backend |

### FASE 1 — ALTA PRIORIDAD (Semana 3-6)

| # | Acción | Módulo | Esfuerzo |
|---|--------|--------|----------|
| 1.1 | Expediente digital del funcionario (subida de documentos: contrato, títulos, evaluaciones) | RRHH | 5 días |
| 1.2 | Historial de movimientos y custodios de obras | Inventario | 4 días |
| 1.3 | Registro de intervenciones/restauraciones de obras | Inventario | 3 días |
| 1.4 | Flujo de aprobación formal de reservas de auditorio con número de expediente | Auditorio | 5 días |
| 1.5 | Aviso de privacidad y consentimiento de datos personales | Recepción + RegistroPublico | 2 días |
| 1.6 | Implementar clasificación patrimonial de obras (BIC, monumento, etc.) | Inventario | 2 días |
| 1.7 | Generación de comprobante digital de trámites (visita, inscripción, reserva) | Recepción + Talleres + Auditorio | 4 días |

### FASE 2 — MEDIA PRIORIDAD (Semana 7-10)

| # | Acción | Módulo | Esfuerzo |
|---|--------|--------|----------|
| 2.1 | Módulo de vacaciones, permisos y licencias | RRHH | 5 días |
| 2.2 | Registro de sanciones y procedimientos disciplinarios | RRHH | 3 días |
| 2.3 | Bitácora de eliminaciones en papelera (quién, cuándo, por qué) | Papelera | 1 día |
| 2.4 | Tablas de retención documental configurables | Papelera | 2 días |
| 2.5 | Control de salidas temporales de obras (préstamos, exhibiciones) | Inventario | 4 días |
| 2.6 | Consentimiento informado para datos de menores (LOPNNA) | Talleres + RegistroPublico | 2 días |
| 2.7 | Evaluación de desempeño de funcionarios | RRHH | 4 días |

### FASE 3 — MEJORA CONTINUA (Semana 11-14)

| # | Acción | Módulo | Esfuerzo |
|---|--------|--------|----------|
| 3.1 | Constancias/certificados automatizados de talleres | Talleres | 3 días |
| 3.2 | Control de aforo del museo | Recepción | 2 días |
| 3.3 | Doble factor de autenticación (2FA) | Auth | 3 días |
| 3.4 | Catálogo público en línea (OPAC) | Biblioteca | 3 días |
| 3.5 | Migración a software libre (evaluación) | Transversal | — |
| 3.6 | Accesibilidad WCAG 2.1 (L4 Art. 14) | Transversal | Continuo |

---

## 5. REQUERIMIENTOS TRANSVERSALES

### 5.1 Seguridad de la Información (L4, L9)

- [ ] Implementar headers de seguridad HTTP (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [ ] Auditoría de logs del sistema (quién hizo qué, cuándo, desde qué IP)
- [ ] Cifrado en tránsito (HTTPS obligatorio — ya implementado en producción)
- [ ] Cifrado en reposo de datos sensibles (cédulas, teléfonos)
- [ ] Plan de continuidad de negocio y respaldo de datos

### 5.2 Accesibilidad (L4 Art. 14)

- [ ] Etiquetas ARIA en formularios y componentes interactivos
- [ ] Contraste suficiente (WCAG AA)
- [ ] Navegación por teclado completa
- [ ] Textos alternativos en imágenes
- [ ] Subtítulos en contenido multimedia (tour guiado, videos instructivos)

### 5.3 Transparencia Activa (L9 Art. 8)

- [ ] Publicar en el sistema (o portal asociado):
  - [ ] Estructura organizativa del museo
  - [ ] Presupuesto asignado y ejecutado
  - [ ] Nómina de funcionarios
  - [ ] Contrataciones realizadas
  - [ ] Donaciones recibidas
  - [ ] Agenda cultural programada
  - [ ] Estadísticas de visitantes

### 5.4 Interoperabilidad (L4, L5 LOPCYOTA)

- [ ] API REST documentada (OpenAPI/Swagger) — el backend tiene endpoints pero falta documentación estandarizada
- [ ] Formatos abiertos para exportación (CSV, JSON, PDF/A)
- [ ] Capacidad de integración con el Sistema de Gestión Documental y Archivos (SIGDA)
- [ ] Compatibilidad con el Sistema de Registro de Funcionarios Públicos (SIRFP)

### 5.5 Software Libre y Estándares Abiertos (L4 Art. 34)

- **Stack actual:** React (MIT) + Node.js (MIT) + TypeScript (Apache 2.0) + PostgreSQL (PostgreSQL license)
- **Evaluación:** Todas las licencias son permisivas de código abierto. Sin embargo, la L4 Art. 34 exige **software libre** (que garantice las 4 libertades: uso, estudio, modificación, redistribución). Las licencias MIT/Apache 2.0 sí cumplen con la definición de software libre de la FSF.
- **Acción:** Solicitar pronunciamiento del CNTI sobre la conformidad del stack tecnológico. Mientras tanto, documentar el análisis de licencias.

---

## 6. ANEXO: CHECKLIST DE VERIFICACIÓN

### Uso diario (obligatorio)

- [ ] Todos los funcionarios registran entrada y salida (LOTTT Art. 177)
- [ ] Las obras en exhibición tienen su registro al día (L6)
- [ ] Los visitantes son registrados con su cédula y motivo (L5)
- [ ] Las reservas de auditorio tienen código único y fecha/hora (LOPA)

### Semanal

- [ ] Revisión de asistencias y horas semanales (L7, L8)
- [ ] Verificación de topes de capacidad en salas
- [ ] Respaldo de base de datos (L4)

### Mensual

- [ ] Estadísticas de visitantes procesadas
- [ ] Revisión de papelera y eliminaciones definitivas (L11)
- [ ] Actualización de tabla de retención documental
- [ ] Revisión de bitácora de accesos (L9)

### Trimestral

- [ ] Evaluación de desempeño de funcionarios (L7)
- [ ] Reporte de novedades de personal (ingresos, retiros, sanciones)
- [ ] Verificación de cumplimiento de cuotas de inclusión laboral
- [ ] Revisión de condiciones de conservación de colecciones (L6)

### Anual

- [ ] Inventario físico vs. digital de obras (L6)
- [ ] Declaración jurada de patrimonio de funcionarios (L9)
- [ ] Auditoría interna del sistema (L9)
- [ ] Actualización de políticas de privacidad y seguridad
- [ ] Renovación de certificados SSL
- [ ] Evaluación de cumplimiento legal del sistema

---

## RESPONSABILIDADES LEGALES

La implementación de este plan es responsabilidad de:

| Rol | Responsabilidad |
|-----|----------------|
| **Director del Museo** | Velar por el cumplimiento general de la L6 (Patrimonio Cultural) y L7 (Función Pública) |
| **Administrador del Sistema** | Implementar medidas técnicas de seguridad (L4, L9) |
| **Jefe de RRHH** | Mantener expedientes digitales, control de asistencia, permisos (L7, L8) |
| **Curador / Restaurador** | Registro de obras, movimientos, intervenciones (L6) |
| **Todos los funcionarios** | Uso correcto del sistema, protección de datos, reporte de incidentes |

---

*Documento elaborado con base en la legislación venezolana vigente a julio de 2026. La LOPCYOTA (abril 2026) introduce cambios sustanciales que requieren implementación en un plazo máximo de 180 días continuos desde su publicación.*
