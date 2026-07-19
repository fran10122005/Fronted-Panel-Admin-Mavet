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
  clasificacion_patrimonial?: string;
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

export interface PinVerificarPayload {
  cedulaTrabajador?: string;
  qr_uuid?: string;
  pin: string;
}

export interface PinConfirmarPayload {
  tokenConfirmacion: string;
  dispositivo?: string;
  coordenadas?: { lat: number; lng: number };
}

export interface PinCambiarPayload {
  cedulaTrabajador?: string;
  qr_uuid?: string;
  pin_actual: string;
  pin_nuevo: string;
}

export interface PinVerificarResponse {
  valido: boolean;
  token: string;
  trabajador: {
    nombres: string;
    apellidos: string;
    cedula: string;
    id: string;
  };
  siguienteMovimiento: string | null;
  serverTime: string;
}

export interface ConfirmarAsistenciaResponse {
  message: string;
  tipoMovimiento: string;
  timestamp: string;
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
  numero_expediente?: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  extendedProps: {
    organizador: string;
    tipoEvento: string;
    cedula?: string;
    estado: string;
    estatus_aprobacion: 'pendiente' | 'aprobado' | 'rechazado';
    numero_expediente?: string;
    motivo_rechazo?: string;
    aprobado_por_nombre?: string;
    correo_electronico?: string;
    recursos_solicitados?: string[];
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
  fecha_nacimiento?: string;
  direccion?: string;
  horas_semanales?: number;
  estado: "Activo" | "Inactivo";
  qr_uuid?: string;
  foto_url?: string;
  pin_hash?: string;
  descriptor_facial?: string;
  descriptores_faciales?: string[];
  usarFacial?: boolean;
  consentimientoFacial?: boolean;
  fechaConsentimiento?: string;
  Persona?: {
    nombres: string;
    apellidos: string;
    cedula: string;
  };
  Cargo?: {
    nombre_cargo: string;
  };
}

export interface EstadoAsistencia {
  trabajador: { nombres: string; apellidos: string; cedula: string; id: string };
  siguienteMovimiento: string | null;
  entradaActual: string | null;
  horasTranscurridas: number | null;
  tienePin: boolean;
  usarFacial: boolean;
  descriptorFacial?: string | null;
  descriptoresFaciales?: string[] | null;
  cantidadDescriptores?: number;
  asistencia: {
    entrada_manana: string | null;
    salida_manana: string | null;
    horas_cumplidas_dia: number | null;
  } | null;
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
    cedula?: string;
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
  horas_justificadas?: number | null;
  tipo_justificacion?: TipoJustificacion | null;
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

export type TipoJustificacion = "falta_dia_completo" | "falta_parcial" | "llegada_tardia" | "salida_anticipada";

export interface DiaResumen {
  id: string;
  fecha: string;
  entrada: string | null;
  salida: string | null;
  horas: number | null;
  observaciones: string | null;
  horas_justificadas: number | null;
  tipo_justificacion?: TipoJustificacion | null;
  retardo?: boolean;
  salida_temprano?: boolean;
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
  dias: DiaResumen[];
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

export interface HorarioDia {
  id_horario?: string | null;
  id_trabajador?: string;
  dia_semana: number;
  dia_label?: string;
  hora_entrada: string;
  hora_salida: string;
  es_dia_laborable: boolean;
  observaciones?: string | null;
}

export interface TrabajadorDocumento {
  id_documento: string;
  id_trabajador: string;
  tipo_documento: string;
  nombre_archivo: string;
  ruta_archivo: string;
  mime_type?: string;
  tamano_archivo?: number;
  notas?: string;
  fecha_subida: string;
}

export interface Justificacion {
  id_justificacion: string;
  id_trabajador: string;
  fecha: string;
  tipo: 'falta_dia_completo' | 'falta_parcial' | 'llegada_tardia' | 'salida_anticipada';
  hora_inicio?: string;
  hora_fin?: string;
  motivo: string;
  descripcion?: string;
  archivo_ruta?: string;
  archivo_nombre?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  created_at: string;
  Trabajador?: {
    id_trabajador: string | number;
    nombres: string;
    apellidos: string;
    cedula: string;
    correo_personal?: string;
  };
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

export interface TopLectorStats {
  id_persona: string;
  nombres: string;
  apellidos: string;
  cedula: string;
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
  topLectores: TopLectorStats[];
  totalLectores: number;
  totales: TotalesEstadisticas;
}
