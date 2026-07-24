# MAVET 2.0 — Propuesta de Experiencia Usuario (Costo Cero)

Funcionalidades **wow** que ya son posibles con el stack actual y **sin presupuesto adicional**.

---

## 1. Portal Web Público (ya hay backend listo)

El módulo CMS ya existe en el backend — `GET /api/cms/talleres`, `/eventos`, `/obras` — y permite marcar qué contenido se muestra al público.

**Qué haríamos:**
- Una landing page React separada (o subruta `/publico`) que consuma esos endpoints.
- Muestra: obras destacadas, próximos talleres con cupo, eventos del auditorio.
- Sin autenticación. Cualquier persona entra y ve la programación del museo.

**Stack:** React + Vite + endpoints CMS existentes. **Costo: $0.**

> **Impacto:** El museo pasa de no tener presencia web a tener un portal vivo y actualizado automáticamente.

---

## 2. Certificados Digitales con Validación QR

Ya tenemos PDFKit en el backend. Los certificados de talleres ya se generan.

**Qué haríamos:**
- Rediseñar el PDF con logo, firma digital, fecha, código QR único.
- Endpoint público `GET /api/certificados/validar/:uuid` que devuelve los datos del certificado.
- Página pública donde cualquiera escanea el QR y ve: "Este certificado es válido — fulano completó el taller X el Y".
- El alumno descarga su certificado desde el portal público.

**Stack:** PDFKit (existe) + endpoint público + página QR. **Costo: $0.**

> **Impacto:** Los certificados tienen validez pública. Cualquier empresa puede verificar si el título es auténtico.

---

## 3. Carnet Digital QR para Trabajadores

Cada trabajador ya tiene un `qr_uuid` en la tabla `trabajadores`.

**Qué haríamos:**
- Página protegida dentro del panel (o PWA) que muestre: foto, nombre, cargo, código QR grande.
- El QR se escanea en la entrada para marcar asistencia (el sistema ya soporta QR attendance).
- El trabajador abre su teléfono, muestra el QR, y pasa.

**Stack:** Panel React existente + QR existente en DB. **Costo: $0.**

> **Impacto:** Los trabajadores ya no piden carnet físico. Entrada más rápida, sin plásticos, sin reposiciones.

---

## 4. Pantalla de Bienvenida en la Entrada (Digital Signage)

Una TV o monitor en la recepción conectada a una computadora vieja o Chromecast.

**Qué haríamos:**
- Ruta `/signage` en React que muestra en pantalla completa:
  - Reloj, fecha, temperatura, nombre del museo.
  - Eventos del día (talleres, funciones en el auditorio) — datos en vivo del backend.
  - Aforo actual: "Hay X personas en el museo".
  - Obra destacada de la semana con foto.
  - Rotación automática de contenido.

**Stack:** Una página React que se abre en Chrome → kiosko mode → F11. **Costo: $0** (si hay un monitor y un dispositivo con navegador).

> **Impacto:** El museo se ve moderno. Los visitantes entran y ven información útil. Sin intervención del personal.

---

## 5. Dashboard de Estadísticas en Vivo en Pantalla Grande

Versión extendida del signage, pensada para sala de reuniones o área de empleados.

**Qué haríamos:**
- Pantalla con gráficos en vivo: visitantes hoy, ingresos por motivo, asistencia del personal, próximas reservas del auditorio.
- Actualización automática cada 30 segundos.
- Ideal para que gerencia vea el estado del museo de un vistazo.

**Stack:** Recharts (ya existe) + polling al backend. **Costo: $0.**

> **Impacto:** El gerente entra, mira la pantalla y sabe cómo está el museo sin preguntarle a nadie.

---

## 6. PWA — La App "Instalable" sin App Store

El panel actual ya puede ser una Progressive Web App.

**Qué haríamos:**
- Agregar `manifest.json` + service worker.
- El usuario entra desde Chrome → "Instalar app" → queda en su escritorio como si fuera una app nativa.
- Soporte offline parcial (ver datos cacheados sin internet).
- Notificaciones push (Push API, sin costo).

**Stack:** `vite-plugin-pwa` + service worker. **Costo: $0.**

> **Impacto:** Los empleados abren la app desde el escritorio de su celular como si fuera nativa. Sin Play Store, sin aprobaciones.

---

## 7. Tour Virtual del Museo con Fotos 360° (Gratis)

**Qué haríamos:**
- Usar **Marzipano** (herramienta open-source gratuita) para crear un tour virtual con fotos 360° del museo.
- Las fotos se toman con cualquier celular (Google Street View app, gratuita).
- Se aloja como página estática en la web pública.
- Puntos interactivos: click en una obra → muestra info extraída del backend MAVET.

**Stack:** Marzipano (open source) + fotos con celular + integración JSON con backend. **Costo: $0** (solo tiempo de tomar fotos).

> **Impacto:** Una persona en cualquier parte del mundo recorre el museo desde su celular. Ideal para promoción.

---

## 8. Compartir en Redes Sociales

**Qué haríamos:**
- Botón "Compartir en Instagram/WhatsApp" en obras destacadas del portal público.
- Al compartir, se genera una imagen con la obra + nombre del museo + link.
- Los visitantes promocionan el museo sin que el museo invierta en publicidad.

**Stack:** `html2canvas` (gratis) + API de compartir del navegador. **Costo: $0.**

> **Impacto:** Marketing orgánico. Cada visitante que comparte una obra es un anuncio gratuito.

---

## 9. Recordatorios Automáticos por Correo

Ya tenemos EmailJS integrado.

**Qué haríamos:**
- Notificar al visitante: "Su taller de cerámica es mañana a las 10am".
- Notificar al solicitante: "Su reserva del auditorio fue aprobada".
- Notificar al trabajador: "Tiene una justificación pendiente por revisar".
- Todo con plantillas HTML profesionales con el logo del museo.

**Stack:** EmailJS (ya configurado) + cron jobs (ya existen). **Costo: $0** (tier gratuito de EmailJS).

> **Impacto:** El museo se comunica profesionalmente sin que nadie tenga que enviar correos manualmente.

---

## 10. Autenticación Biométrica (Rostro) para Empleados

Ya tenemos `face-api.js` en el frontend y descriptores faciales guardados.

**Qué haríamos:**
- En lugar de PIN + QR, el empleado se para frente a la cámara y su rostro marca la entrada.
- Pantalla dedicada en la entrada del personal: solo se ve la cámara, detecta la cara, marca asistencia.
- Feedback visual: "Bienvenido, Juan" con check verde.

**Stack:** `face-api.js` (ya instalado) + cámara web. **Costo: $0.**

> **Impacto:** El empleado llega, mira a la cámara y ya marcó. Sin tarjetas, sin PIN, sin contacto físico.

---

## Prioridad vs Esfuerzo

| # | Proyecto | Esfuerzo | Impacto | Costo |
|---|---|---|---|---|
| 1 | Portal Web Público | 2-3 semanas | ⭐⭐⭐⭐⭐ | $0 |
| 2 | Carnet Digital QR | 2 días | ⭐⭐⭐⭐ | $0 |
| 3 | Certificados con QR | 3-4 días | ⭐⭐⭐⭐⭐ | $0 |
| 4 | Pantalla Bienvenida (Signage) | 2 días | ⭐⭐⭐⭐ | $0 |
| 5 | Dashboard TV Gerencia | 3 días | ⭐⭐⭐⭐ | $0 |
| 6 | PWA (app instalable) | 1 día | ⭐⭐⭐ | $0 |
| 7 | Tour Virtual 360° | 1-2 semanas | ⭐⭐⭐⭐⭐ | $0 |
| 8 | Compartir en Redes | 1 día | ⭐⭐⭐ | $0 |
| 9 | Recordatorios Email | 2-3 días | ⭐⭐⭐⭐ | $0 |
| 10 | Reconocimiento Facial Entrada | 3-4 días | ⭐⭐⭐⭐⭐ | $0 |

---

**Resumen:** Todo es posible con el stack actual. No hay servicios de pago, ni hardware costoso, ni licencias. Solo tiempo de desarrollo.
