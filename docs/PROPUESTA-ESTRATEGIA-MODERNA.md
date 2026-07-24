# Propuesta de Estrategia Moderna — Sistema MAVET

## Visión General

Transformar MAVET de un sistema monolítico funcional a una plataforma escalable,
observable, y preparada para crecimiento futuro mediante la adopción progresiva de
arquitecturas, herramientas y prácticas modernas de ingeniería de software.

---

## 1. Arquitectura: Event-Driven + Microservices Readiness

### Estado actual
Backend monolítico Express con 11 módulos acoplados al mismo servidor y base de datos.

### Propuesta

**Fase 1 — Event Bus interno (manteniendo monolith)**
- Usar Redis pub/sub (ya hay Redis en infra) como event bus interno.
- Cada módulo publica eventos: `taller.creado`, `asistencia.registrada`, `espacio.reservado`.
- Servicios suscriptores reaccionan sin acoplamiento directo.
- Beneficio: elimina dependencias circulares entre módulos; prepara el terreno para microservicios.

**Fase 2 — Separación por bounded context**
- Extraer módulos de alto tráfico (Visitantes, RRHH, Educación) a servicios independientes.
- Cada servicio con su propia base de datos (DB per service).
- API Gateway (Express Gateway, KrakenD, o un simple reverse proxy con Nginx) unifica el acceso.

**Fase 3 — Comunicación async para procesos pesados**
- Reportes PDF (hoy PDFKit síncrono en el request) pasan a job queue (BullMQ + Redis).
- El frontend polling o WebSocket recibe el PDF generado. tiempo de respuesta HTTP cae de segundos a ms.

---

## 2. Infraestructura como Código (IaC) + CI/CD

### Estado actual
Deploy manual desde GitHub a Render. Sin gestión declarativa de infraestructura.

### Propuesta

**Docker multi-stage para frontend y backend**
```dockerfile
# Backend ejemplo
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

**GitHub Actions CI/CD**
```yaml
on: [push, pull_request]
jobs:
  lint-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test

  deploy:
    needs: lint-test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: railway up  # o render deploy hook
```

**Terraform o Pulumi para infraestructura**
- Base de datos, Redis, storage, dominio, CDN declarados como código.
- Entornos: `staging` (branch `develop`) y `production` (branch `main`).

---

## 3. Estrategia de Calidad: Pirámide de Tests

### Estado actual
Tests de integración con Jest + Supertest (cubren API). Sin unit tests ni E2E.

### Propuesta

| Capa | Herramienta | Objetivo |
|---|---|---|
| Unitarios (70%) | Vitest (frontend), Jest (backend) | Hooks, servicios puros, utilidades |
| Integración (20%) | Supertest + base de datos test | Endpoints críticos: auth, asistencia, talleres |
| E2E (10%) | Playwright | Flujos completos: login → registro asistencia → reporte |

**Coverage gate:** `≥80%` en módulos críticos (RRHH, Educación, Visitantes).

**Contract testing** con **Pact** si se avanza a microservicios, para garantizar compatibilidad entre servicios.

---

## 4. Observabilidad: Logs, Métricas, Trazas

### Estado actual
`console.log` esparcido. Sin métricas ni tracing. Dependencia de logs de Render.

### Propuesta

| Pilar | Herramienta | Implementación |
|---|---|---|
| Logs estructurados | Winston o Pino | JSON output con `reqId`, `userId`, `module`, `duration` |
| Métricas | Prometheus + /metrics endpoint | Request count, latency P50/P95/P99, error rate, DB pool size |
| Dashboards | Grafana | Vista unificada de métricas + logs |
| Trazas distribuidas | OpenTelemetry | Tracing entre frontend ↔ API ↔ DB ↔ Redis |
| Alertas | Grafana OnCall o PagerDuty | Error rate > 1%, latencia > 2s, 5xx > 5/min |

Ejemplo de log estructurado:
```js
logger.info({ module: 'asistencia', userId: req.user.id, durationMs }, 'Asistencia registrada');
```

---

## 5. Performance y Escalabilidad

### Estado actual
Sin índices explícitos en consultas frecuentes. Caché Redis para respuestas GET completas.

### Propuesta

**Índices de base de datos**
- Crear índices compuestos para las consultas más frecuentes:
  - `asistencias_qr(fecha, id_trabajador)`
  - `registros_ingresos(fecha, id_motivo)`
  - `inscripciones_talleres(id_taller, id_alumno)`
  - `bitacora_auditoria(created_at, modulo)`

**Caching multi-nivel**
- Capa 1: React Query (TanStack Query) en frontend — stale-while-revalidate.
- Capa 2: Redis en backend — TTL dinámico según frecuencia de cambio del recurso.
- Capa 3: CDN (Cloudflare o similar) para assets estáticos.

**Database connection pooling**
- Configurar PgBouncer o usar pool size óptimo en Sequelize (actualmente default = 10).
- Monitorear con `SELECT * FROM pg_stat_activity`.

---

## 6. UX Moderna: Tiempo Real y Offline-First

### Estado actual
UI con polling implícito (refetch manual). Sin soporte offline.

### Propuesta

**WebSockets con Socket.io (o SSE)**
- Notificaciones en vivo: "Nueva solicitud de espacio", "Asistencia registrada", "Taller alcanzó cupo".
- Tablero de Recepcionista actualizado en tiempo real cuando un visitante se registra.

**TanStack Query (React Query)**
- Ya instalado como dependencia — estandarizar su uso en toda la app.
- `useQuery` para fetching con caché automática.
- `useMutation` para escrituras con invalidación de queries relacionadas.
- Beneficio: elimina `useEffect` + `fetch` manual, reduce requests, mejora UX.

**Skeleton loading + Optimistic UI**
- Mientras se resuelve el request, mostrar skeleton de la tabla/tarjeta.
- En mutaciones (ej. aprobar solicitud), actualizar UI inmediatamente y revertir si falla.

---

## 7. Seguridad Moderna

### Estado actual
JWT + bcryptjs + rate limiting básico. Sin MFA ni auditoría granular.

### Propuesta

**Multi-factor Authentication (MFA)**
- TOTP (Google Authenticator o similar) para roles administrativos (Administrador, Gerente).
- Librería: `otplib` + `qrcode` para setup.

**Refresh token rotation**
- Actualmente hay `refreshToken` — implementar rotation: cada refresh invalida el anterior.
- Almacenar familia de refresh tokens en DB para detectar reuse (posible token theft).

**Auditoría granular**
- Extender `bitacora_auditoria` para capturar: `requestBody` (sanitizado), `responseCode`, `userAgent`, `ip`.
- Dashboard de auditoría con filtros avanzados (ya existe ruta `/auditoria`).

**Rate limiting avanzado**
- Por endpoint específico (ej. login: 5/min, registro de asistencia: 30/min).
- Usar `express-rate-limit` con store Redis (ya está en las dependencias).

---

## 8. Data & Business Intelligence

### Estado actual
Dashboard con estadísticas básicas (counts, gráficos simples con Recharts).

### Propuesta

**Data Warehouse liviano**
- Vista materializada en PostgreSQL actualizada cada hora con métricas agregadas.
- Esquema: `dashboard_mensual`, `asistencia_diaria`, `ingresos_por_motivo`.

**Reportes automáticos programados**
- Reporte semeneral de ingresos de visitantes → enviado por EmailJS cada lunes.
- Reporte mensual de asistencia de personal.
- PDF generado por cron job y almacenado en Cloudinary.

**Predictive analytics (futuro)**
- Predicción de afluencia de visitantes basada en datos históricos (modelo simple Prophet o regresión lineal).
- Sugerencia de horarios óptimos para talleres según tasa de ocupación histórica.

---

## 9. Estrategia de Datos: Migraciones + Seeders

### Estado actual
Modelos creados con `sync({ alter: true })` en producción. Sin migraciones formales.

### Propuesta

**Migraciones con Sequelize CLI**
```bash
npx sequelize-cli migration:generate --name add-indice-asistencia-fecha
```
- Cada cambio de esquema es versionado, revisable, reversible.
- `sync({ alter: true })` solo para desarrollo local.

**Seeders para datos de referencia**
- Roles, permisos, motivos de visita, espacios del museo, cargos.
- Entornos: `development`, `test`, `production`.

---

## 10. Roadmap Propuesto

| Fase | Plazo | Entregables |
|---|---|---|
| **Inmediata** (1-2 semanas) | Docker + CI/CD + TanStack Query + Logs estructurados |
| **Corto** (1 mes) | WebSockets + React Query adoption + Índices DB |
| **Mediano** (2-3 meses) | Event Bus + Job Queue para PDFs + MFA |
| **Largo** (6+ meses) | Microservicios (RRHH, Visitantes) + BI + Predictive |

---

## Resumen de Tecnologías Propuestas

| Área | Tecnología | Propósito |
|---|---|---|
| Event Bus | Redis Pub/Sub + BullMQ | Comunicación async entre módulos |
| CI/CD | GitHub Actions + Docker | Build → Test → Deploy automatizado |
| Tests | Vitest, Playwright, Supertest | Pirámide de calidad |
| Observabilidad | Winston/Pino + Prometheus + Grafana + OpenTelemetry | Entender qué pasa en producción |
| Tiempo Real | Socket.io | Notificaciones y dashboards vivos |
| Cache Frontend | TanStack Query | Fetch inteligente con caché |
| MFA | otplib + qrcode | Segundo factor de autenticación |
| Infraestructura | Docker + Terraform | Entornos reproducibles |
| Migraciones | Sequelize CLI | Cambios de esquema versionados |
| Métricas | Prometheus + Grafana | Monitoreo y alertas |
