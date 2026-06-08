# API Reference

El frontend se conecta a un backend en `http://localhost:3000` mediante `fetch`. Todas las rutas protegidas envían `Authorization: Bearer <token>` en los headers.

## Endpoints

### Autenticación

| Método | Endpoint               | Auth | Descripción                        |
| ------ | ---------------------- | ---- | ---------------------------------- |
| POST   | `/api/auth/login`      | No   | Inicio de sesión                   |
| POST   | `/api/auth/register`   | Sí   | Registro de nuevo usuario          |
| GET    | `/api/auth/me`         | Sí   | Perfil del usuario autenticado     |
| PUT    | `/api/auth/me`         | Sí   | Actualizar perfil propio           |
| GET    | `/api/auth`            | Sí   | Listar usuarios                    |
| PUT    | `/api/auth/:id`        | Sí   | Actualizar usuario                 |
| GET    | `/api/auth/roles`      | Sí   | Listar roles disponibles           |

### Inventario de Obras

| Método | Endpoint                  | Auth | Descripción                    |
| ------ | ------------------------- | ---- | ------------------------------ |
| GET    | `/api/obras/obras`        | Sí   | Listar todas las obras         |
| POST   | `/api/obras/obras`        | Sí   | Crear nueva obra               |
| PUT    | `/api/obras/obras/:id`    | Sí   | Actualizar obra                |
| DELETE | `/api/obras/obras/:id`    | Sí   | Eliminar obra                  |
| GET    | `/api/obras/artistas`     | No   | Listar artistas                |
| GET    | `/api/obras/tecnicas`     | No   | Listar técnicas                |
| GET    | `/api/obras/estados`      | No   | Listar estados de obra         |
| GET    | `/api/obras/categorias`   | No   | Listar categorías              |

### Biblioteca

| Método | Endpoint                             | Auth | Descripción                         |
| ------ | ------------------------------------ | ---- | ----------------------------------- |
| GET    | `/api/biblioteca/libros`             | Sí   | Listar libros                       |
| POST   | `/api/biblioteca/libros`             | Sí   | Crear libro                         |
| PUT    | `/api/biblioteca/libros/:id`         | Sí   | Actualizar libro                    |
| DELETE | `/api/biblioteca/libros/:id`         | Sí   | Eliminar libro                      |
| POST   | `/api/biblioteca/consultas-sala`     | Sí   | Registrar préstamo en sala          |
| PUT    | `/api/biblioteca/libros/:id/devolver`| Sí   | Devolver libro                      |
| GET    | `/api/biblioteca/autores`            | Sí   | Listar autores                      |
| GET    | `/api/biblioteca/categorias`         | Sí   | Listar categorías                   |

### RRHH

| Método | Endpoint                       | Auth | Descripción                         |
| ------ | ------------------------------ | ---- | ----------------------------------- |
| GET    | `/api/rrhh/trabajadores`       | Sí   | Listar trabajadores                 |
| POST   | `/api/rrhh/trabajadores`       | Sí   | Registrar trabajador                |
| PUT    | `/api/rrhh/trabajadores/:id`   | Sí   | Actualizar trabajador               |
| GET    | `/api/rrhh/asistencias`        | Sí   | Listar registros de asistencia      |
| POST   | `/api/rrhh/asistencias`        | No   | Registrar asistencia (kiosko)       |
| GET    | `/api/rrhh/cargos`             | Sí   | Listar cargos                       |

### Visitantes / Ingresos

| Método | Endpoint                               | Auth | Descripción                       |
| ------ | -------------------------------------- | ---- | --------------------------------- |
| GET    | `/api/visitantes/motivos`              | No   | Motivos de visita                 |
| GET    | `/api/visitantes/ingresos/check/:cedula`| No  | Verificar si visitante existe     |
| POST   | `/api/visitantes/ingresos`             | No   | Registrar ingreso                 |
| GET    | `/api/visitantes/ingresos/stats`       | Sí   | Estadísticas de ingresos          |

### Educación (Talleres y Auditorio)

| Método | Endpoint                                    | Auth | Descripción                          |
| ------ | ------------------------------------------- | ---- | ------------------------------------ |
| GET    | `/api/educacion/talleres`                   | Sí   | Listar talleres                      |
| POST   | `/api/educacion/talleres`                   | Sí   | Crear taller                         |
| GET    | `/api/educacion/instructores`               | Sí   | Listar instructores                  |
| GET    | `/api/educacion/espacios`                   | Sí   | Listar espacios del museo            |
| GET    | `/api/educacion/inscripciones-talleres`     | Sí   | Listar inscripciones                 |
| POST   | `/api/educacion/inscripciones-talleres`     | Sí   | Inscribir alumno                     |
| GET    | `/api/educacion/solicitudes-espacio`        | Sí   | Listar eventos/reservas              |
| POST   | `/api/educacion/solicitudes-espacio`        | Sí   | Crear reserva                        |
| PUT    | `/api/educacion/solicitudes-espacio/:id`    | Sí   | Actualizar reserva                   |
| DELETE | `/api/educacion/solicitudes-espacio/:id`    | Sí   | Eliminar reserva                     |

### Reportes (PDF)

| Método | Endpoint                          | Auth | Descripción                        |
| ------ | --------------------------------- | ---- | ---------------------------------- |
| GET    | `/api/reportes/dashboard`         | Sí   | Estadísticas para dashboard        |
| GET    | `/api/reportes/obras`             | Sí   | PDF del inventario de obras        |
| GET    | `/api/reportes/asistencia`        | Sí   | PDF del reporte de asistencia      |
| GET    | `/api/reportes/carta-aval/:cedula`| Sí   | PDF carta aval de horas            |
| GET    | `/api/reportes/eventos`           | Sí   | PDF historial de eventos           |
