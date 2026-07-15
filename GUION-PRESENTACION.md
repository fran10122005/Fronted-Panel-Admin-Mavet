# Guion de Presentación — Panel MAVET

*Documento guía para la defensa de servicio comunitario.*

---

## 1. Login — Inicio de Sesión

**Duración estimada:** ~2 min

> "La pantalla de inicio de sesión es la puerta de entrada al sistema. El usuario ingresa su correo y contraseña. Si los datos son correctos, el sistema lo deja entrar y lo redirige a su pantalla principal.

> Dependiendo del rol que tenga asignado (Gerente, Recepcionista, Bibliotecario, etc.), el sistema le mostrará diferentes opciones y secciones a las que puede acceder. Si alguien intenta entrar a una sección que no le corresponde, el sistema lo bloquea automáticamente."

**Ideas clave:**
- Entrada con correo y contraseña
- Cada usuario tiene un rol que define lo que puede ver y hacer
- El sistema protege las secciones según el rol

---

## 2. Dashboard — Pantalla Principal

**Duración estimada:** ~3 min

> "Apenas el usuario inicia sesión, llega a su pantalla principal o tablero de control. Esta pantalla se adapta según el rol:

> - **Gerente:** Ve un resumen general del museo: cuántas obras hay en la bóveda, cuántos libros en la biblioteca, cuántos visitantes han ido en el mes, eventos próximos, visitantes frecuentes, y gráficos de movimiento diario.
> - **Recepcionista:** Ve un resumen más simple con los visitantes del mes y accesos directos a sus funciones principales.
> - **Bibliotecario:** Consulta los libros registrados y los más consultados.
> - **Educador:** Ve los próximos eventos y talleres.
> - **Curador:** Revisa las obras en la bóveda y las que están en restauración."

**Ideas clave:**
- Cada rol ve su propio tablero
- Muestra información importante de un vistazo
- Incluye números, listas y gráficos

---

## 3. Recursos Humanos (RRHH)

**Duración estimada:** ~4 min

> "La sección de Recursos Humanos es exclusiva para el Gerente. Está organizada en tres pestañas:

> **Primera pestaña — Trabajadores:** Aquí se gestionan todos los empleados del museo. Se puede registrar un nuevo trabajador con sus datos y foto, editar información existente, o eliminar registros. También permite generar el carnet del trabajador en PDF y exportar la lista completa.

> **Segunda pestaña — Usuarios:** Aquí se administran las personas que tienen acceso al sistema. Se les asigna un rol (Gerente, Recepcionista, etc.) y se vincula con su ficha de trabajador. Permite crear cuentas nuevas, restablecer contraseñas y desactivar usuarios.

> **Tercera pestaña — Asistencias:** Controla la entrada y salida de los empleados. Muestra un resumen semanal con las horas que cada trabajador debe cumplir, las horas acumuladas y las que le hacen falta. Se pueden agregar observaciones y justificar horas cuando sea necesario."

**Ideas clave:**
- Solo el Gerente puede entrar aquí
- Tres funciones: empleados, usuarios del sistema, y control de asistencia
- Permite generar carnets y reportes

---

## 4. Recepción

**Duración estimada:** ~4 min

> "La pantalla de Recepción es donde se registra la entrada de los visitantes al museo. Está disponible para Recepcionistas y Gerentes. Se divide en dos partes:

> **Lado izquierdo — Buscar y Registrar:** El recepcionista puede buscar a una persona por su cédula, nombre o teléfono. Si la persona ya había visitado antes, el sistema trae sus datos automáticamente. Luego completa el motivo de la visita (consulta, evento, taller, etc.) y registra el ingreso. También puede registrar niños que acompañen al visitante.

> **Lado derecho — Información del día:** Muestra la agenda de eventos y talleres programados para hoy, y una lista de todos los ingresos que se han registrado durante el día, mes o año.

> **Funciones adicionales:** El recepcionista puede generar un código QR que los visitantes pueden escanear con su teléfono para registrarse ellos mismos, y también puede marcar la entrada y salida del personal."

**Ideas clave:**
- Registrar visitantes que llegan al museo
- Buscar personas que ya habían venido antes
- Ver eventos del día y control de ingresos
- Generar QR para que los visitantes se registren solos

---

## 5. Registro de Visitantes — Público

**Duración estimada:** ~3 min

> "Esta pantalla está diseñada para que cualquier persona pueda registrar su entrada al museo sin ayuda del recepcionista, ya sea escaneando un código QR o entrando directamente a la dirección `/registro-visitante` desde su teléfono.

> Funciona en tres pasos sencillos:

> **Paso 1:** El visitante ingresa su número de cédula. El sistema revisa si ya había venido antes.

> **Paso 2:** Si es su primera vez, debe llenar sus datos (nombre, apellido, teléfono). Si ya había venido, el sistema lo saluda por su nombre. Luego selecciona el motivo de su visita, que puede ser una clase (si es alumno), un evento del día, o una visita general.

> **Paso 3:** El sistema confirma que el ingreso fue registrado exitosamente y le da la opción de registrar a otra persona."

**Ideas clave:**
- No necesita iniciar sesión, es público
- El visitante se registra solo desde su celular
- Tres pasos: cédula → datos → confirmación
- Detecta si el visitante ya había venido antes

---

## Resumen de Módulos

| Módulo | ¿Quién lo usa? | ¿Para qué sirve? |
|--------|---------------|------------------|
| Login | Todos | Entrar al sistema según el rol |
| Dashboard | Todos | Ver información importante de un vistazo |
| RRHH | Gerente | Gestionar empleados, usuarios y asistencias |
| Recepción | Recepcionista, Gerente | Registrar visitas que llegan al museo |
| Registro Visitante | Público | Que los visitantes se registren solos |

---

## Posible Orden de Exposición

1. **Login** — Cómo se entra al sistema (1-2 min)
2. **Dashboard** — Lo que ve cada usuario al entrar (2-3 min)
3. **Recepción** — Registro de visitantes presencial (3-4 min)
4. **Registro Visitante** — Registro por QR / autogestión (2-3 min)
5. **RRHH** — Gestión de personal (3-4 min)

**Total estimado:** 12-16 minutos
