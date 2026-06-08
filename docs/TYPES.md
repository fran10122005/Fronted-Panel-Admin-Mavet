# TypeScript Types

Definiciones en `src/types/index.ts`.

## Obra

```typescript
interface Obra {
  id: string;
  codigo_inventario?: string;
  titulo: string;
  autor: string;
  medidas: string;
  ano: number;
  tecnica: string;
  categoria: string;
  tipo_ingreso: string;
  piezas: number;
  peso?: number;
  descripcion?: string;
  id_artista?: number;
  id_tecnica?: number;
  id_estado_actual?: number;
  id_categoria_obra?: number;
  estado: string;
  ubicacion: string;
}
```

## Libro

```typescript
interface Libro {
  id: string;
  unidad: string;
  cuota: string;
  titulo: string;
  autor: string;
  estante: string;
  ano_libro: string | number;
  id_categoria?: number;
  categoria?: string;
  cantidad_total: number;
  cantidad_disponible: number;
  estado: string;
  fecha_ingreso: string;
  id_autor?: number;
}
```

## PrestamoPayload

```typescript
interface PrestamoPayload {
  libroId: string;
  cedulaSolicitante: string;
  nombreSolicitante: string;
  horaPrestamo: string;
  estado: "ACTIVO" | "DEVUELTO";
}
```

## AsistenciaPayload

```typescript
interface AsistenciaPayload {
  cedulaTrabajador: string;
  tipoMovimiento: "Entrada Mañana" | "Salida Mañana" | "Entrada Tarde" | "Salida Tarde";
  timestamp: string;
}
```

## RegistroVisitantePayload

```typescript
interface RegistroVisitantePayload {
  nombre: string;
  cedula: string;
  telefono: string;
  edad: string;
  institucion?: string;
  profesion?: string;
}
```

## TallerInscripcionPayload

```typescript
interface TallerInscripcionPayload {
  tallerId: string;
  alumno: { nombre: string; edad: string };
  representante: { nombre: string; cedula: string; telefono: string };
}
```

## EventoAuditorio

```typescript
interface EventoAuditorio {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: {
    organizador: string;
    tipoEvento: string;
  };
}
```

## Trabajador

```typescript
interface Trabajador {
  id?: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  cargo: string;
  horas_semanales?: number;
  estado: "Activo" | "Inactivo";
}
```

## Usuario

```typescript
interface Usuario {
  id: number;
  correo: string;
  rol: string;
  estado: boolean;
  trabajador?: {
    nombre: string;
    cargo: string;
  };
}
```

## RegistroAsistencia

```typescript
interface RegistroAsistencia {
  id: string;
  fecha: string;
  cedula: string;
  trabajadorNombre: string;
  cargo: string;
  entradaManana: string;
  salidaTarde: string;
  horasCumplidas: number | null;
  observaciones: string;
}
```
