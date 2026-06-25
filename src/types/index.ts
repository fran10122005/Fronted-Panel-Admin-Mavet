export interface Obra {
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
  imagen_url?: string;
}

export interface Libro {
  id: string;
  unidad: string;            // Código de unidad/catalogación
  cuota: string;             // Número largo de catalogación (Dewey, etc.)
  titulo: string;
  autor: string;             // Nombre completo del autor (para mostrar en tabla)
  estante: string;           // Ubicación física en la biblioteca
  ano_libro: string | number; // Año de publicación
  id_categoria?: number;     // ID para el select de categoría en el formulario
  categoria?: string;        // Nombre de categoría (para mostrar en tabla)
  cantidad_total: number;    // Total de ejemplares
  cantidad_disponible: number;
  estado: string;
  fecha_ingreso: string;     // Fecha de ingreso al inventario
  id_autor?: number;         // ID para el select de autor en el formulario
}

export interface PrestamoPayload {
  libroId: string;
  cedulaSolicitante: string;
  nombreSolicitante: string;
  horaPrestamo: string;
  estado: "ACTIVO" | "DEVUELTO";
}

export interface AsistenciaPayload {
  cedulaTrabajador: string;
  tipoMovimiento: "Entrada Mañana" | "Salida Mañana" | "Entrada Tarde" | "Salida Tarde";
  timestamp: string;
}

export interface RegistroVisitantePayload {
  nombre: string;
  cedula: string;
  telefono: string;
  edad: string;
  institucion?: string;
  profesion?: string;
}

export interface TallerInscripcionPayload {
  tallerId: string;
  alumno: {
    nombre: string;
    edad: string;
  };
  representante: {
    nombre: string;
    cedula: string;
    telefono: string;
  };
}

export interface EventoAuditorio {
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

export interface Trabajador {
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

export interface Usuario {
  id: number;
  correo: string;
  rol: string;
  estado: boolean;
  id_trabajador?: number;
  trabajador?: {
    nombre: string;
    cargo: string;
  };
}

export interface RegistroAsistencia {
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

export interface Prestamo {
  id: string;
  libroId: string;
  libroTitulo: string;
  libroUnidad: string;
  cedulaSolicitante: string;
  nombreSolicitante: string;
  fechaPrestamo: string;
  fechaDevolucion?: string;
  estado: "ACTIVO" | "DEVUELTO";
}

export interface TopVisitante {
  cedula: string;
  nombre: string;
  totalVisitas: number;
  ultimaVisita: string;
}

export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export interface Cargo {
  id_cargo: number;
  nombre_cargo: string;
}

export interface UsuarioPayload {
  correo: string;
  password?: string;
  id_rol: number;
  id_trabajador?: number;
  estado?: boolean;
}

export interface TrabajadorPayload {
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  correo_personal?: string;
  id_cargo?: number;
  horas_semanales?: number;
  estado?: string | boolean;
  direccion?: string;
  fecha_nacimiento?: string;
  fecha_ingreso?: string;
}
