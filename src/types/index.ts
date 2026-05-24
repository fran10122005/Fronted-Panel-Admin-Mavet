export interface Obra {
  id: string;
  titulo: string;
  autor: string;
  medidas: string;
  ano: number;
  tecnica: string;
  modalidad: string;
  estado: "Excelente" | "Bueno" | "Restauración";
  ubicacion: string;
}

export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  estante: string;
  cantidad: number;
  cuota: number;
  estado: "Aprobado" | "Pendiente" | "Descartado/Venta";
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
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  cargo: string;
  estado: "Activo" | "Inactivo";
}

export interface RegistroAsistencia {
  id: string;
  fecha: string;
  cedula: string;
  trabajadorNombre: string;
  cargo: string;
  entradaManana: string;
  salidaManana: string;
  entradaTarde: string;
  salidaTarde: string;
}
