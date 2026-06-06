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

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const mavetApi = {
  // === Inventario Bóveda ===
  getObras: async (): Promise<Obra[]> => {
    const res = await fetch("http://localhost:3000/api/obras/obras", {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Error fetching obras: ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return list.map((item: any) => ({
      id: item.id_obra.toString(),
      titulo: item.titulo || "Sin título",
      autor: item.Artista
        ? `${item.Artista.nombres || ""} ${item.Artista.apellidos || ""}`.trim()
        : "Desconocido",
      medidas: item.medidas || "",
      ano: item.anio || 0,
      tecnica: item.TecnicaObra?.nombre_tecnica || "",
      modalidad: item.tipo_ingreso || "N/A",
      estado: item.EstadoObra?.nombre_estado || "Bueno",
      ubicacion: item.ubicacion_actual || "Depósito"
    }));
  },

  crearObra: async (payload: Obra): Promise<{ success: boolean; message: string }> => {
    const res = await fetch("http://localhost:3000/api/obras/obras", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al crear la obra");
    return { success: true, message: "Obra agregada exitosamente al inventario." };
  },

  actualizarObra: async (id: string, payload: Obra): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`http://localhost:3000/api/obras/obras/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al actualizar la obra");
    return { success: true, message: "Obra actualizada exitosamente." };
  },

  eliminarObra: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`http://localhost:3000/api/obras/obras/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar la obra");
    return { success: true, message: "Obra eliminada del inventario." };
  },

  // === Biblioteca ===
  getLibros: async (): Promise<Libro[]> => {
    try {
      const res = await fetch("http://localhost:3000/api/biblioteca/libros", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching libros");
      const data = await res.json();
      return data.map((item: any) => ({
        id: item.id_libro.toString(),
        titulo: item.titulo,
        autor: item.AutorLibros?.[0]?.nombre || item.Autores?.[0]?.nombre || "Desconocido", // handle both possible associations
        estante: item.unidad || "Depósito",
        cantidad: item.cantidad_total || 1,
        cuota: item.cantidad_disponible !== undefined ? item.cantidad_disponible : 1,
        estado: item.estado || "Aprobado"
      }));
    } catch {
      return [];
    }
  },

  crearLibro: async (payload: Libro): Promise<{ success: boolean; message: string }> => {
    const res = await fetch("http://localhost:3000/api/biblioteca/libros", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al crear el libro");
    return { success: true, message: "Libro registrado exitosamente." };
  },

  actualizarLibro: async (id: string, payload: Libro): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`http://localhost:3000/api/biblioteca/libros/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al actualizar el libro");
    return { success: true, message: "Libro actualizado exitosamente." };
  },

  eliminarLibro: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`http://localhost:3000/api/biblioteca/libros/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar el libro");
    return { success: true, message: "Libro eliminado del inventario." };
  },

  registrarPrestamo: async (payload: PrestamoPayload): Promise<{ success: boolean; message: string }> => {
    const res = await fetch("http://localhost:3000/api/biblioteca/consultas-sala", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al registrar el préstamo");
    }
    return { success: true, message: "Préstamo registrado exitosamente en el sistema." };
  },

  // === Asistencia y RRHH ===
  getTrabajadores: async (): Promise<Trabajador[]> => {
    try {
      const res = await fetch("http://localhost:3000/api/rrhh/trabajadores", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(`Error fetching trabajadores: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      return list.map((item: any) => ({
        cedula: item.cedula,
        nombre: item.nombres,
        apellido: item.apellidos,
        telefono: item.telefono || "",
        correo: item.correo_personal || "",
        cargo: item.CargoTrabajador?.nombre_cargo || "Sin cargo",
        estado: item.estado || "Activo"
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getAsistencia: async (): Promise<RegistroAsistencia[]> => {
    try {
      const res = await fetch("http://localhost:3000/api/rrhh/asistencias", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(`Error fetching asistencias: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      return list.map((item: any) => {
        const t = item.Trabajador || {};
        const c = t.CargoTrabajador || {};
        return {
          id: item.id_asistencia.toString(),
          fecha: item.fecha,
          cedula: t.cedula || "",
          trabajadorNombre: `${t.nombres || ""} ${t.apellidos || ""}`.trim(),
          cargo: c.nombre_cargo || "Sin cargo",
          entradaManana: item.entrada_manana ? new Date(item.entrada_manana).toLocaleTimeString() : "-",
          salidaManana: item.salida_manana ? new Date(item.salida_manana).toLocaleTimeString() : "-",
          entradaTarde: item.entrada_tarde ? new Date(item.entrada_tarde).toLocaleTimeString() : "-",
          salidaTarde: item.salida_tarde ? new Date(item.salida_tarde).toLocaleTimeString() : "-"
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  registrarTrabajador: async (payload: Trabajador): Promise<{ success: boolean; message: string }> => {
    // We map frontend payload to backend structure
    const body = {
      cedula: payload.cedula,
      nombres: payload.nombre,
      apellidos: payload.apellido,
      telefono: payload.telefono,
      correo_personal: payload.correo,
      // Default to an existing id_cargo if not strictly mapped yet
      id_cargo: payload.cargo === "Curador" ? 1 : payload.cargo === "Seguridad" ? 2 : 3,
      estado: payload.estado
    };

    const res = await fetch("http://localhost:3000/api/rrhh/trabajadores", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Error al registrar trabajador");
    }
    
    return { success: true, message: "Trabajador registrado exitosamente. QR Generado." };
  },

  registrarAsistencia: async (payload: AsistenciaPayload): Promise<{ success: boolean; message: string }> => {
    if (!payload.cedulaTrabajador) throw new Error("Cédula requerida");
    
    const res = await fetch("http://localhost:3000/api/rrhh/asistencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // This is public Kiosk
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Error al registrar asistencia");
    }

    return { success: true, message: `Asistencia de ${payload.tipoMovimiento} registrada con éxito.` };
  },

  // === Registro Público Visitantes / Ingresos ===
  obtenerMotivos: async (): Promise<any[]> => {
    try {
      const res = await fetch("http://localhost:3000/api/visitantes/motivos");
      if (!res.ok) throw new Error("Error fetching motivos");
      return await res.json();
    } catch {
      return [];
    }
  },

  checkVisitante: async (cedula: string): Promise<{ existe: boolean; visitante: any }> => {
    const res = await fetch(`http://localhost:3000/api/visitantes/ingresos/check/${cedula}`);
    if (!res.ok) throw new Error("Error comprobando visitante");
    return await res.json();
  },

  registrarIngreso: async (payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch("http://localhost:3000/api/visitantes/ingresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Public Checkin
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al registrar ingreso");
    return { success: true, message: "Acceso registrado exitosamente." };
  },

  getIngresosStats: async (): Promise<any> => {
    const res = await fetch("http://localhost:3000/api/visitantes/ingresos/stats", {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error fetching stats");
    const json = await res.json();
    return json.data;
  },

  // === Talleres ===
  getTalleres: async (): Promise<any[]> => {
    try {
      const res = await fetch("http://localhost:3000/api/educacion/talleres", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching talleres");
      return await res.json();
    } catch {
      return [];
    }
  },

  getInscripcionesTaller: async (): Promise<any[]> => {
    try {
      const res = await fetch("http://localhost:3000/api/educacion/inscripciones-talleres", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching inscripciones");
      return await res.json();
    } catch {
      return [];
    }
  },

  inscribirTaller: async (payload: TallerInscripcionPayload): Promise<{ success: boolean; message: string }> => {
    const res = await fetch("http://localhost:3000/api/educacion/inscripciones-talleres", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al inscribir alumno");
    }
    return { success: true, message: "Alumno inscrito correctamente." };
  },

  // === Auditorio ===
  getEventos: async (): Promise<EventoAuditorio[]> => {
    try {
      const res = await fetch("http://localhost:3000/api/educacion/solicitudes-espacio", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching eventos");
      const data = await res.json();
      return data.map((item: any) => ({
        id: item.id_solicitud.toString(),
        title: item.motivo_uso || "Evento",
        start: `${item.fecha_solicitada}T${item.hora_inicio || "00:00:00"}`,
        end: `${item.fecha_solicitada}T${item.hora_fin || "23:59:59"}`,
        allDay: !item.hora_inicio,
        extendedProps: {
          organizador: item.nombre_responsable,
          tipoEvento: item.institucion || "Conferencia"
        }
      }));
    } catch {
      return [];
    }
  },

  registrarReservaAuditorio: async (payload: any): Promise<{ success: boolean; message: string; data?: any }> => {
    const res = await fetch("http://localhost:3000/api/educacion/solicitudes-espacio", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al crear reserva");
    const data = await res.json();
    return { success: true, message: "Reserva registrada exitosamente", data: data.data };
  },

  actualizarReservaAuditorio: async (id: string, payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`http://localhost:3000/api/educacion/solicitudes-espacio/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al actualizar reserva");
    return { success: true, message: "Reserva actualizada exitosamente" };
  },

  eliminarReservaAuditorio: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`http://localhost:3000/api/educacion/solicitudes-espacio/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar reserva");
    return { success: true, message: "Reserva eliminada" };
  },

  // === Auth ===
  login: async (correo: string, password: string): Promise<{ token: string; usuario: any }> => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Credenciales incorrectas");
    }
    return data.data; // { token, usuario }
  },

  // === Dashboard Stats ===
  getDashboardStats: async (): Promise<any> => {
    try {
      const res = await fetch("http://localhost:3000/api/reportes/dashboard", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching dashboard stats");
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
};
