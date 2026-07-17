


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
