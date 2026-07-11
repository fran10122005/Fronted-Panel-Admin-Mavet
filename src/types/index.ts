export interface Artista {
  id_artista: number;
  nombres: string;
  apellidos: string;
  ci?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  nacionalidad?: string;
}

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
  unidad: string;
  cuota: string;
  titulo: string;
  autor: string;
  estante: string;
  ano_libro: string | number;
  id_categoria?: number;
  categoria?: string;
  id_autor?: number;
  cantidad_total: number;
  cantidad_disponible: number;
  estado: string;
  fecha_ingreso: string;
}

export interface PrestamoPayload {
  libroId: string;
  cedulaSolicitante: string;
  nombreSolicitante: string;
  horaPrestamo: string;
  estado: "ACTIVO" | "DEVUELTO";
}

export interface AsistenciaPayload {
  cedulaTrabajador?: string;
  qr_uuid?: string;
  tipoMovimiento: string;
  observaciones?: string;
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
  codigo_reserva?: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  extendedProps: {
    organizador: string;
    tipoEvento: string;
    cedula?: string;
  };
}

export interface Trabajador {
  id?: number | string;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  cargo: string;
  id_cargo: string;
  fecha_ingreso: string;
  horas_semanales?: number;
  estado: "Activo" | "Inactivo";
  qr_uuid?: string;
  foto_url?: string;
  Persona?: {
    nombres: string;
    apellidos: string;
    cedula: string;
  };
  Cargo?: {
    nombre_cargo: string;
  };
}

export interface Usuario {
  id: string;
  correo: string;
  rol: string;
  estado: boolean;
  id_trabajador?: string;
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
  entrada: string;
  salida: string;
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

export interface ResumenSemanalTrabajador {
  id_trabajador: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  cargo: string | null;
  horas_semanales: number;
  horas_acumuladas: number;
  horas_restantes: number;
  cumplio: boolean;
  justificado?: boolean;
  observaciones: string | null;
  dias: Array<{
    id: string;
    fecha: string;
    entrada: string | null;
    salida: string | null;
    horas: number | null;
    observaciones: string | null;
  }>;
}

export interface TopVisitante {
  cedula: string;
  nombre: string;
  totalVisitas: number;
  ultimaVisita: string;
}

export interface Rol {
  id_rol: string;
  nombre_rol: string;
}

export interface Cargo {
  id_cargo: string;
  nombre_cargo: string;
}

export interface UsuarioPayload {
  correo: string;
  password?: string;
  id_rol: string;
  id_trabajador?: string;
  estado?: boolean;
}

export interface TrabajadorPayload {
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  correo_personal?: string;
  id_cargo?: string;
  horas_semanales?: number;
  estado?: string | boolean;
  direccion?: string;
  fecha_nacimiento?: string;
  fecha_ingreso?: string;
}

export interface ConsultaSalaFiltrada {
  id_consulta: string;
  id_libro: string;
  id_persona: string | null;
  id_trabajador: string | null;
  estado: string;
  hora_entrega: string;
  hora_devolucion: string | null;
  observaciones: string | null;
  Persona?: {
    id_persona: string;
    nombres: string;
    apellidos: string;
    cedula: string;
  };
  Libro?: {
    id_libro: string;
    titulo: string;
    estante: string;
  };
}

export interface ConsultasFiltradasResponse {
  data: ConsultaSalaFiltrada[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  } | null;
}

export interface TopLibroStats {
  id_libro: string;
  titulo: string;
  total_consultas: number;
}

export interface TotalesEstadisticas {
  hoy: number;
  semana: number;
  mes: number;
  activas: number;
  devueltas: number;
}

export interface EstadisticasBiblioteca {
  topLibros: TopLibroStats[];
  totales: TotalesEstadisticas;
}
