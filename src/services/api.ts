import { 
  Obra, 
  Libro, 
  PrestamoPayload, 
  AsistenciaPayload, 
  RegistroVisitantePayload, 
  TallerInscripcionPayload,
  EventoAuditorio,
  Trabajador,
  RegistroAsistencia
} from "../types";

// Mock Data
const ObrasMock: Obra[] = [
  { id: "OBR-001", titulo: "Paisaje Andino", autor: "Manuel Otero", medidas: "120x80 cm", ano: 1998, tecnica: "Óleo sobre lienzo", modalidad: "Pintura", estado: "Excelente", ubicacion: "Sala Principal" },
  { id: "OBR-002", titulo: "Busto de Bolívar", autor: "Desconocido", medidas: "50x40x30 cm", ano: 1950, tecnica: "Bronce", modalidad: "Escultura", estado: "Bueno", ubicacion: "Bóveda" },
  { id: "OBR-003", titulo: "Abstracto I", autor: "Luisa Cáceres", medidas: "90x90 cm", ano: 2015, tecnica: "Acrílico", modalidad: "Pintura", estado: "Restauración", ubicacion: "Taller" },
];

const LibrosMock: Libro[] = [
  { id: "LIB-1001", titulo: "Historia del Arte Venezolano", autor: "Boulton, Alfredo", estante: "Estante A - Fila 2", cantidad: 3, cuota: 1, estado: "Aprobado" },
  { id: "LIB-1002", titulo: "Técnicas de Restauración", autor: "Smith, John", estante: "Estante B - Fila 1", cantidad: 1, cuota: 0, estado: "Pendiente" },
  { id: "LIB-1003", titulo: "Catálogo Exposición 1990", autor: "MAVET", estante: "Archivo Histórico", cantidad: 5, cuota: 5, estado: "Descartado/Venta" },
  { id: "LIB-1004", titulo: "Color y Forma en la Escultura", autor: "García, Pedro", estante: "Estante C - Fila 4", cantidad: 2, cuota: 1, estado: "Aprobado" },
];

const AsistenciaMock: RegistroAsistencia[] = [
  { id: "AST-001", fecha: new Date().toISOString().split("T")[0], cedula: "V-12345678", trabajadorNombre: "María González", cargo: "Curador", entradaManana: "08:00 AM", salidaManana: "12:05 PM", entradaTarde: "01:55 PM", salidaTarde: "05:00 PM" },
  { id: "AST-002", fecha: new Date().toISOString().split("T")[0], cedula: "V-87654321", trabajadorNombre: "Carlos Ruiz", cargo: "Seguridad", entradaManana: "08:15 AM", salidaManana: "12:00 PM", entradaTarde: "02:00 PM", salidaTarde: "05:05 PM" },
  { id: "AST-003", fecha: new Date().toISOString().split("T")[0], cedula: "V-11223344", trabajadorNombre: "Ana López", cargo: "Guía de Museo", entradaManana: "07:55 AM", salidaManana: "12:10 PM", entradaTarde: "02:20 PM", salidaTarde: "-" },
];

// Helper para simular latencia de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mavetApi = {
  // === Inventario Bóveda ===
  getObras: async (): Promise<Obra[]> => {
    await delay(800);
    return [...ObrasMock];
  },

  // === Biblioteca ===
  getLibros: async (): Promise<Libro[]> => {
    await delay(800);
    return [...LibrosMock];
  },

  registrarPrestamo: async (payload: PrestamoPayload): Promise<{ success: boolean; message: string }> => {
    await delay(1200);
    return { success: true, message: "Préstamo registrado exitosamente en el sistema." };
  },

  // === Asistencia y RRHH ===
  getAsistencia: async (): Promise<RegistroAsistencia[]> => {
    await delay(800);
    return [...AsistenciaMock];
  },

  registrarTrabajador: async (payload: Trabajador): Promise<{ success: boolean; message: string }> => {
    await delay(1200);
    return { success: true, message: "Trabajador registrado exitosamente. QR Generado." };
  },

  registrarAsistencia: async (payload: AsistenciaPayload): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    if (!payload.cedulaTrabajador) throw new Error("Cédula requerida");
    return { success: true, message: `Asistencia de ${payload.tipoMovimiento} registrada con éxito.` };
  },

  // === Registro Público Visitantes ===
  registrarVisitante: async (payload: RegistroVisitantePayload): Promise<{ success: boolean; message: string }> => {
    await delay(1500); 
    return { success: true, message: "Visitante registrado exitosamente." };
  },

  // === Talleres ===
  inscribirTaller: async (payload: TallerInscripcionPayload): Promise<{ success: boolean; message: string }> => {
    await delay(1200);
    return { success: true, message: "Alumno inscrito correctamente en el taller." };
  },

  // === Auditorio ===
  getEventos: async (): Promise<EventoAuditorio[]> => {
    await delay(800);
    return [
      { id: "1", title: "Taller de Pintura", start: new Date().toISOString().split("T")[0], end: new Date().toISOString().split("T")[0], allDay: true, extendedProps: { organizador: "Juan Pérez", tipoEvento: "Taller" } },
      { id: "2", title: "Exposición Fotográfica", start: new Date(Date.now() + 86400000).toISOString().split("T")[0], end: new Date(Date.now() + 86400000).toISOString().split("T")[0], allDay: true, extendedProps: { organizador: "MAVET", tipoEvento: "Exposición" } }
    ];
  },
};
