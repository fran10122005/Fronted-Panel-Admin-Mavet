# Módulos del Sistema

## Dashboard (`/`)
- Estadísticas globales del museo
- Cards con totales: Obras, Libros, Visitantes, Eventos
- Gráficos de ingresos mensuales

## Inventario de Bóveda (`/inventario-obras`)
- CRUD completo de obras de arte
- Campos: código de inventario, título, autor, técnica, categoría, medidas, año, estado de conservación, ubicación
- Modal con formulario para crear/editar obras
- Generación de PDF del inventario completo

## Biblioteca (`/biblioteca`)
- Catálogo de libros con sistema de préstamos para lectura en sala
- CRUD de libros con categorización
- Préstamos con registro de solicitante (cédula, nombre)
- Control de disponibilidad (cantidad_total / cantidad_disponible)
- Filtros y búsqueda en tabla

## RRHH (`/rrhh`)
- Registro y gestión de trabajadores
- Generación de códigos QR para cada trabajador
- Consolidación de firmas para carta de aval de horas
- Control de asistencia (consulta histórica)
- Exportar reporte de asistencia en PDF
- Exportar carta de aval individual en PDF
- Gestión de usuarios del sistema (vinculados a trabajadores)

## Recepción (`/recepcion`)
- Control de taquilla
- Registro manual de visitantes
- Estadísticas de ingresos

## Talleres (`/talleres`)
- Gestión de talleres educativos
- Inscripción de alumnos
- CRUD de instructores
- Ficha de alumno con datos del representante
- Listado de espacios del museo

## Auditorio (`/auditorio`)
- Calendario de reservas (FullCalendar)
- Registro de solicitudes de espacio
- Eventos con organizador y tipo
- CRUD completo de reservas
- Exportar historial de eventos en PDF

## Educación (`/educacion`)
- Página contenedora que agrupa Talleres y Auditorio

## Kiosko de Asistencia (`/asistencia`) — Pública
- Interfaz de uso público para control diario de entradas/salidas
- Registro por cédula
- Tipos de movimiento: Entrada Mañana, Salida Mañana, Entrada Tarde, Salida Tarde

## Registro Público (`/registro-visitante`) — Pública
- Auto-registro de visitantes (nombre, cédula, teléfono, edad)
- Verificación automática si el visitante ya existe
- Selección de motivo de visita

## Perfil de Usuario (`/profile`)
- Visualización y edición de datos personales del usuario autenticado
- Datos del trabajador vinculado

## Roles y Permisos

| Rol                          | Acceso                                                    |
| ---------------------------- | --------------------------------------------------------- |
| Administrador / admin        | Todos los módulos                                         |
| Curador                      | Inventario de Bóveda                                      |
| Bibliotecario / Guía         | Biblioteca                                                |
| Recursos Humanos             | RRHH                                                      |
| Recepcionista / Seguridad    | Recepción                                                 |
| Gestor de Eventos y Talleres | Talleres, Auditorio                                       |
| Educación                    | Talleres, Auditorio                                       |

## Mapa de Rutas

| Ruta                  | Componente         | Layout     | Auth |
| --------------------- | ------------------ | ---------- | ---- |
| `/`                   | Home               | AppLayout  | Sí   |
| `/profile`            | UserProfiles       | AppLayout  | Sí   |
| `/inventario-obras`   | InventarioBoveda   | AppLayout  | Sí   |
| `/biblioteca`         | Biblioteca         | AppLayout  | Sí   |
| `/rrhh`               | RRHH               | AppLayout  | Sí   |
| `/recepcion`          | Recepcion          | AppLayout  | Sí   |
| `/talleres`           | Talleres           | AppLayout  | Sí   |
| `/auditorio`          | Auditorio          | AppLayout  | Sí   |
| `/educacion`          | Educacion          | AppLayout  | Sí   |
| `/ingresos`           | Ingresos           | AppLayout  | Sí   |
| `/calendar`           | Calendar           | AppLayout  | Sí   |
| `/form-elements`      | FormElements       | AppLayout  | Sí   |
| `/basic-tables`       | BasicTables        | AppLayout  | Sí   |
| `/alerts`             | Alerts             | AppLayout  | Sí   |
| `/avatars`            | Avatars            | AppLayout  | Sí   |
| `/badge`              | Badges             | AppLayout  | Sí   |
| `/buttons`            | Buttons            | AppLayout  | Sí   |
| `/images`             | Images             | AppLayout  | Sí   |
| `/videos`             | Videos             | AppLayout  | Sí   |
| `/line-chart`         | LineChart          | AppLayout  | Sí   |
| `/bar-chart`          | BarChart           | AppLayout  | Sí   |
| `/asistencia`         | Asistencia         | Ninguno    | No   |
| `/registro-visitante` | RegistroPublico    | Ninguno    | No   |
| `/signin`             | SignIn             | Ninguno    | No   |
| `/signup`             | SignUp             | Ninguno    | No   |
| `*` (404)             | NotFound           | Ninguno    | No   |
