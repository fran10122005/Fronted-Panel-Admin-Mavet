# Flujo de Registro de Asistencia con PIN (Doble Factor)

## Cumplimiento del Artículo 10 - Reglamento Parcial de la LOTTT

> *"El registro debe ser firmado o marcado por el trabajador de forma consciente."*

---

## Diagrama de flujo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PANTALLA 1: ESCANEO / INGRESO                    │
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────┐                       │
│  │   Escanear QR    │    │  Ingreso Manual  │                       │
│  │  (cámara kiosko) │    │  (teclear cédula) │                       │
│  └────────┬─────────┘    └────────┬─────────┘                       │
│           │                       │                                 │
│           └───────────┬───────────┘                                 │
│                       │                                             │
│                       ▼                                             │
│           GET /api/rrhh/asistencias/estado                          │
│            ?qr_uuid=... | ?cedulaTrabajador=...                     │
│                       │                                             │
│                       ▼                                             │
│  ╔═══════════════════════════════════════════════════════════╗      │
│  ║  Respuesta del backend:                                  ║      │
│  ║  {                                                    ║      │
│  ║    trabajador: { nombres, apellidos, cedula },          ║      │
│  ║    siguienteMovimiento: "Entrada" | "Salida" | null,    ║      │
│  ║    tienePin: true | false,                              ║      │
│  ║    ...                                                ║      │
│  ║  }                                                    ║      │
│  ╚═══════════════════════════════════════════════════════╝      │
│                       │                                             │
│            ┌──────────┴──────────┐                                  │
│            ▼                     ▼                                  │
│   ┌────────────────┐   ┌──────────────────────────┐                 │
│   │  tienePin: true │   │ tienePin: false          │                 │
│   │  → Avanza a     │   │ → "PIN no configurado.  │                 │
│   │    Pantalla 2   │   │   Contacte a RRHH"      │                 │
│   └────────────────┘   └──────────────────────────┘                 │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PANTALLA 2: INGRESO DE PIN                       │
│                                                                     │
│               ┌──────────────────────────┐                          │
│               │  ●  ●  ●  ○  ○  ○       │  (4-6 dígitos)          │
│               └──────────────────────────┘                          │
│                                                                     │
│          ┌─────┐ ┌─────┐ ┌─────┐                                   │
│          │  1  │ │  2  │ │  3  │  (teclado táctil optimizado       │
│          ├─────┤ ├─────┤ ├─────┤   para tablets/quioscos)           │
│          │  4  │ │  5  │ │  6  │                                   │
│          ├─────┤ ├─────┤ ├─────┤                                   │
│          │  7  │ │  8  │ │  9  │                                   │
│          ├─────┤ └─────┘ └─────┘                                   │
│          │BORR │ │  0  │ │ ⌫   │                                   │
│          └─────┴───────┴─────┘                                   │
│                                                                     │
│                       │                                             │
│                       ▼                                             │
│           POST /api/rrhh/asistencias/verificar-pin                  │
│           Body: { cedulaTrabajador, pin }                           │
│                                                                     │
│  ╔═══════════════════════════════════════════════════════════╗      │
│  ║  Validaciones del backend:                              ║      │
│  ║  1. Buscar trabajador por cédula o qr_uuid              ║      │
│  ║  2. Verificar que pin_hash exista                       ║      │
│  ║  3. Verificar que no esté bloqueado                     ║      │
│  ║     (pin_bloqueado_hasta < ahora)                       ║      │
│  ║  4. bcrypt.compare(pin, pin_hash)                       ║      │
│  ╚═══════════════════════════════════════════════════════╝      │
│                       │                                             │
│         ┌─────────────┴─────────────┐                               │
│         ▼                           ▼                               │
│  ┌──────────────┐          ┌──────────────────────┐                 │
│  │  PIN correcto │          │  PIN incorrecto      │                 │
│  └──────┬───────┘          └──────────┬───────────┘                 │
│         │                             │                             │
│         ▼                             ▼                             │
│  • Resetea intentos=0          • Incrementa intentos               │
│  • Genera JWT                  • Si intentos >= 3:                 │
│    (expira en 2 min)             • Bloquea por 5 min              │
│  • Log en bitácora               • Log en bitácora                │
│    (tipo: pin_exitoso)           • Muestra error +                │
│  → Avanza a Pantalla 3            reintentos restantes            │
│                                  • Si bloqueado:                   │
│                                    "Espere N minutos"             │
│  ╔═══════════════════════════════════════════════════════╗      │
│  ║  Respuesta exitosa:                                  ║      │
│  ║  {                                                    ║      │
│  ║    valido: true,                                     ║      │
│  ║    token: "eyJhbGciOiJIUzI1NiIs...",                 ║      │
│  ║    trabajador: { nombres, apellidos, cedula },        ║      │
│  ║    siguienteMovimiento: "Entrada",                    ║      │
│  ║    serverTime: "2026-07-17T10:35:22.000Z"            ║      │
│  ║  }                                                    ║      │
│  ╚═══════════════════════════════════════════════════════╝      │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 PANTALLA 3: CONFIRMACIÓN EXPLÍCITA                  │
│                                                                     │
│                     ┌──────────────────┐                            │
│                     │    (ícono)      │                            │
│                     └──────────────────┘                            │
│                Nombre Completo del Trabajador                       │
│                V-12345678 (Cédula)                                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────┐               │
│  │              FECHA Y HORA OFICIAL                 │              │
│  │                                                  │              │
│  │       17 de julio de 2026                        │              │
│  │           10:35:22 AM          ← HORA DEL SERVIDOR              │
│  │                                                  │              │
│  └──────────────────────────────────────────────────┘               │
│                                                                     │
│  ┌──────────────────────────────────────────────────┐               │
│  │              TIPO DE REGISTRO                    │               │
│  │                                                  │               │
│  │              ╔════════════╗                      │               │
│  │              ║  ENTRADA   ║  (verde)             │               │
│  │              ╚════════════╝                      │               │
│  │                                                  │               │
│  └──────────────────────────────────────────────────┘               │
│                                                                     │
│  ┌──────────────────────────────────────────────────┐               │
│  │    Confirme su entrada - 10:35:22 AM             │               │
│  └──────────────────────────────────────────────────┘               │
│                                                                     │
│                                                                     │
│       ┌──────────────────────┐       ┌──────────────────────┐       │
│       │                      │       │                      │       │
│       │      CANCELAR        │       │      CONFIRMAR       │       │
│       │                      │       │                      │       │
│       │  (vuelve a escaneo)  │       │  (registra marcación)│       │
│       │                      │       │                      │       │
│       └──────────────────────┘       └──────────────────────┘       │
│                                                                     │
└──────────┬───────────────────────────────────────────┬──────────────┘
           │                                           │
           ▼                                           ▼
┌──────────────────────┐             ┌──────────────────────────────────┐
│  CANCELAR             │             │  CONFIRMAR                       │
│                       │             │                                  │
│  POST /confirmar      │             │  POST /confirmar                 │
│  (no se registra)     │             │  Body: {                         │
│                       │             │    tokenConfirmacion,            │
│  • Log en bitácora    │             │    dispositivo: "Kiosko-Win",    │
│    (tipo:             │             │    coordenadas?: { lat, lng }    │
│     cancelacion_      │             │  }                               │
│     asistencia)       │             │                                  │
│                       │             │  Backend verifica JWT:           │
│  → Vuelve a           │             │  • Si expiró → "Tiempo expirado" │
│    Pantalla 1         │             │  • Si inválido → error           │
│                       │             │  • Si válido:                    │
│                       │             │     1. Extrae id_trabajador +   │
│                       │             │        tipoMovimiento del token │
│                       │             │     2. Busca trabajador          │
│                       │             │     3. Registra entrada/salida   │
│                       │             │        con timestamp del servidor│
│                       │             │     4. Calcula horas cumplidas   │
│                       │             │     5. Guarda dispositivo, IP,   │
│                       │             │        user-agent                │
│                       │             │     6. Log en bitácora           │
│                       │             │        (tipo: confirmacion_      │
│                       │             │         asistencia)              │
│                       │             │                                  │
│                       │             │  ✅ "Entrada registrada          │
│                       │             │     correctamente"               │
│                       │             │  → Modal se cierra              │
└───────────────────────┘             └──────────────────────────────────┘
```

---

## Endpoints de la API

### 1. Consultar estado del trabajador (existente, modificado)
```
GET /api/rrhh/asistencias/estado?cedulaTrabajador=V-12345678
GET /api/rrhh/asistencias/estado?qr_uuid=550e8400-xxxx
```

**Nuevo campo en respuesta:** `tienePin: boolean`

---

### 2. Verificar PIN (nuevo — público)
```
POST /api/rrhh/asistencias/verificar-pin
Body: {
  cedulaTrabajador?: "V-12345678",
  qr_uuid?: "550e8400-xxxx",
  pin: "1234"              // 4-6 dígitos numéricos
}
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "valido": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "trabajador": {
      "nombres": "Ricardo",
      "apellidos": "López",
      "cedula": "V-12345678",
      "id": "TRB-00001"
    },
    "siguienteMovimiento": "Entrada",
    "serverTime": "2026-07-17T10:35:22.000Z"
  }
}
```

**Respuesta error PIN incorrecto:**
```json
{
  "status": "error",
  "message": "PIN incorrecto. Intentos restantes: 2"
}
```

**Respuesta bloqueado:**
```json
{
  "status": "error",
  "message": "Demasiados intentos fallidos. Intente de nuevo en 5 minuto(s)."
}
```

---

### 3. Confirmar asistencia (nuevo — público, requiere JWT)
```
POST /api/rrhh/asistencias/confirmar
Body: {
  tokenConfirmacion: "eyJhbGciOiJIUzI1NiIs...",
  dispositivo: "Kiosko-Windows-Tablet",    // opcional
  coordenadas: { lat: 7.7667, lng: -72.2333 }  // opcional
}
```

**Registra en bitácora con:** tipo = `confirmacion_asistencia`, IP, user-agent, dispositivo

---

### 4. Cambiar PIN propio (nuevo — público)
```
POST /api/rrhh/asistencias/cambiar-pin
Body: {
  cedulaTrabajador?: "V-12345678",
  pin_actual: "1234",
  pin_nuevo: "5678"
}
```

---

### 5. Restablecer PIN por administrador (nuevo — requiere auth)
```
POST /api/rrhh/asistencias/:id/reset-pin
Headers: Authorization: Bearer <token-admin>
```

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "pinTemporal": "4821",
    "message": "PIN restablecido exitosamente."
  }
}
```

---

## Medidas de seguridad implementadas

| Aspecto | Implementación |
|---------|---------------|
| **Almacenamiento del PIN** | `bcrypt` con salt rounds = 10 (mismo estándar que contraseñas) |
| **Token de confirmación** | JWT firmado, expira en **2 minutos** (ventana estrecha) |
| **Timestamp definitivo** | Tomado del servidor al recibir `POST /confirmar`, no del frontend |
| **Límite de intentos** | **3 intentos fallidos** → bloqueo de **5 minutos** |
| **Bloqueo por trabajador** | Por `id_trabajador`, no por IP (evita bloquear a otros) |
| **Auditoría completa** | Cada evento se registra en `bitacora_auditoria` con IP, user-agent y timestamp |
| **Doble factor** | Requiere algo que el trabajador **tiene** (carnet/QR) + algo que **sabe** (PIN) |
| **Anti-suplantación** | Elimina el "buddy punching" (marcar por otro) |

---

## Datos almacenados

### Tabla `trabajadores` — Campos nuevos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `pin_hash` | VARCHAR(255) nullable | Hash bcrypt del PIN |
| `pin_intentos_fallidos` | INTEGER default 0 | Contador de intentos fallidos consecutivos |
| `pin_bloqueado_hasta` | TIMESTAMP nullable | Fecha/hasta del bloqueo temporal |

### Tabla `bitacora_auditoria` — Nuevos tipos de evento

| tipo | Cuándo se registra |
|------|-------------------|
| `pin_fallido` | Intento de PIN incorrecto |
| `pin_exitoso` | PIN verificado correctamente |
| `pin_cambio` | Trabajador cambia su PIN |
| `pin_reset` | Admin restablece el PIN |
| `confirmacion_asistencia` | Trabajador confirma entrada/salida |
| `cancelacion_asistencia` | Trabajador cancela la marcación |

---

## Componentes frontend creados

| Componente | Archivo | Propósito |
|-----------|---------|-----------|
| `PinDisplay` | `src/components/pin/PinDisplay.tsx` | Muestra círculos para dígitos ingresados |
| `PinKeypad` | `src/components/pin/PinKeypad.tsx` | Teclado numérico táctil para tablets/kioskos |
| `ConfirmacionScreen` | `src/components/pin/ConfirmacionScreen.tsx` | Pantalla final con datos del trabajador, hora del servidor y botones CONFIRMAR/CANCELAR |

---

## Cómo probar el nuevo flujo

1. **Iniciar backend y frontend** normalmente
2. **Asignar PIN a un trabajador:**
   - Ir a RRHH > Trabajadores > Detalle del trabajador
   - Click "Restablecer PIN" → se genera PIN temporal de 4 dígitos
   - Anotar el PIN y entregarlo al trabajador
3. **Abrir Recepción > "Asistencia Personal"**
4. **Probar flujo completo:**
   - Escanear QR del carnet (o ingresar cédula manualmente)
   - Sistema solicita PIN
   - Ingresar PIN correcto → pasa a confirmación
   - Confirmar → registra entrada/salida
   - Cancelar → vuelve a escaneo sin registrar
5. **Probar límite de intentos:**
   - Ingresar PIN incorrecto 3 veces → bloqueo de 5 minutos
   - Verificar que aparece mensaje de bloqueo
6. **Probar cambio de PIN desde el kiosko:**
   - En pantalla de PIN, click "¿Olvidó su PIN? Cámbielo aquí"
   - Seguir pasos: PIN actual → PIN nuevo → Confirmar
