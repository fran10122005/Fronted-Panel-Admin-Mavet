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

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";



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
    const res = await fetch(`${API_BASE}/api/obras/obras`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Error fetching obras: ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return list.map((item: any) => ({
      id: item.id_obra.toString(),
      codigo_inventario: item.codigo_inventario || "",
      titulo: item.titulo || "Sin título",
      autor: item.Artista
        ? `${item.Artista.nombres || ""} ${item.Artista.apellidos || ""}`.trim()
        : "Desconocido",
      id_artista: item.id_artista || undefined,
      id_tecnica: item.id_tecnica || undefined,
      id_estado_actual: item.id_estado_actual || undefined,
      medidas: item.medidas || "",
      ano: item.anio || 0,
      tecnica: item.TecnicaObra?.nombre_tecnica || "",
      categoria: item.CategoriaObra?.nombre_categoria || "",
      id_categoria_obra: item.id_categoria_obra || undefined,
      tipo_ingreso: item.tipo_ingreso || "",
      piezas: item.piezas || 1,
      peso: item.peso || undefined,
      descripcion: item.descripcion || "",
      estado: item.EstadoObra?.nombre_estado || "Bueno",
      ubicacion: item.ubicacion_actual || "Depósito"
    }));
  },

  crearObra: async (payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/obras/obras`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al crear la obra");
    return { success: true, message: "Obra agregada exitosamente al inventario." };
  },

  actualizarObra: async (id: string, payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/obras/obras/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al actualizar la obra");
    return { success: true, message: "Obra actualizada exitosamente." };
  },

  eliminarObra: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/obras/obras/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar la obra");
    return { success: true, message: "Obra eliminada del inventario." };
  },

  // === Biblioteca ===
  getLibros: async (): Promise<Libro[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/biblioteca/libros`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching libros");
      const data = await res.json();
      return data.map((item: any) => {
        // Construir nombre completo del autor desde la relación Many-to-Many
        const primerAutor = item.AutorLibros?.[0];
        const nombreAutor = primerAutor
          ? `${primerAutor.nombre || ""} ${primerAutor.apellido || ""}`.trim()
          : "Desconocido";

        return {
          id:                  item.id_libro.toString(),
          unidad:              item.unidad              || "",
          cuota:               item.cuota               || "",
          titulo:              item.titulo              || "",
          autor:               nombreAutor,
          id_autor:            primerAutor?.id_autor,
          estante:             item.estante             || "",
          ano_libro:           item.ano_libro           || "",
          id_categoria:        item.id_categoria,
          categoria:           item.CategoriaLibro?.nombre_categoria || "",
          cantidad_total:      item.cantidad_total      ?? 0,
          cantidad_disponible: item.cantidad_disponible ?? 0,
          estado:              item.estado              || "Aprobado",
          fecha_ingreso:       item.fecha_ingreso       || ""
        };
      });
    } catch {
      return [];
    }
  },

  crearLibro: async (payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/biblioteca/libros`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al crear el libro");
    return { success: true, message: "Libro registrado exitosamente." };
  },

  actualizarLibro: async (id: string, payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/biblioteca/libros/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al actualizar el libro");
    return { success: true, message: "Libro actualizado exitosamente." };
  },

  eliminarLibro: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/biblioteca/libros/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar el libro");
    return { success: true, message: "Libro eliminado del inventario." };
  },

  registrarPrestamo: async (payload: PrestamoPayload): Promise<{ success: boolean; message: string }> => {
    const body = {
      id_libro: payload.libroId,
      cedula: payload.cedulaSolicitante,
      nombre: payload.nombreSolicitante,
      estado: payload.estado
    };
    const res = await fetch(`${API_BASE}/api/biblioteca/consultas-sala`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al registrar el préstamo");
    }
    return { success: true, message: "Préstamo registrado exitosamente en el sistema." };
  },

  devolverLibro: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/biblioteca/libros/${id}/devolver`, {
      method: "PUT",
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al devolver el libro");
    }
    return { success: true, message: "Libro devuelto exitosamente en el sistema." };
  },

  // === Catálogos (rutas públicas — no requieren token) ===
  getArtistas: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/obras/artistas`);
      if (!res.ok) return [];
      return await res.json();
    } catch { return []; }
  },
  getTecnicas: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/obras/tecnicas`);
      if (!res.ok) return [];
      return await res.json();
    } catch { return []; }
  },
  getEstadosObra: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/obras/estados`);
      if (!res.ok) return [];
      return await res.json();
    } catch { return []; }
  },
  getCategoriasObra: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/obras/categorias`);
      if (!res.ok) return [];
      return await res.json();
    } catch { return []; }
  },
  getAutoresLibro: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/api/biblioteca/autores`, { headers: getHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },
  getCategoriasLibro: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/api/biblioteca/categorias`, { headers: getHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },
  getCargos: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/rrhh/cargos`, { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch {
      return [];
    }
  },

  // === Asistencia y RRHH ===
  getTrabajadores: async (): Promise<Trabajador[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/rrhh/trabajadores`, {
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
        horas_semanales: item.horas_semanales || 0,
        estado: (item.estado === true || item.estado === "Activo") ? "Activo" : "Inactivo",
        id: item.id_trabajador
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getAsistencia: async (): Promise<RegistroAsistencia[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/rrhh/asistencias`, {
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
          salidaTarde: item.salida_tarde ? new Date(item.salida_tarde).toLocaleTimeString() : "-",
          horasCumplidas: item.horas_cumplidas_dia ?? null,
          observaciones: item.observaciones || ""
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  registrarTrabajador: async (payload: any): Promise<{ success: boolean; message: string }> => {
    // We map frontend payload to backend structure
    const body = {
      cedula: payload.cedula,
      nombres: payload.nombres || payload.nombre,
      apellidos: payload.apellidos || payload.apellido,
      telefono: payload.telefono,
      correo_personal: payload.correo_personal || payload.correo,
      id_cargo: payload.id_cargo,
      horas_semanales: payload.horas_semanales,
      estado: payload.estado === "Activo"
    };

    const res = await fetch(`${API_BASE}/api/rrhh/trabajadores`, {
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
    
    const res = await fetch(`${API_BASE}/api/rrhh/asistencias`, {
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
      const res = await fetch(`${API_BASE}/api/visitantes/motivos`);
      if (!res.ok) throw new Error("Error fetching motivos");
      return await res.json();
    } catch {
      return [];
    }
  },

  checkVisitante: async (cedula: string): Promise<{ existe: boolean; visitante: any }> => {
    const res = await fetch(`${API_BASE}/api/visitantes/ingresos/check/${cedula}`);
    if (!res.ok) throw new Error("Error comprobando visitante");
    return await res.json();
  },

  registrarIngreso: async (payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/visitantes/ingresos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Public Checkin
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al registrar ingreso");
    return { success: true, message: "Acceso registrado exitosamente." };
  },

  getIngresosStats: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/visitantes/ingresos/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error fetching stats");
    const json = await res.json();
    return json.data;
  },

  // === Talleres ===
  getTalleres: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/educacion/talleres`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching talleres");
      return await res.json();
    } catch {
      return [];
    }
  },

  crearTaller: async (payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/educacion/talleres`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al crear taller");
    }
    return { success: true, message: "Taller creado correctamente." };
  },

  getInstructores: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/educacion/instructores`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching instructores");
      return await res.json();
    } catch {
      return [];
    }
  },

  getEspaciosMuseo: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/educacion/espacios`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching espacios");
      return await res.json();
    } catch {
      return [];
    }
  },

  getInscripcionesTaller: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/educacion/inscripciones-talleres`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching inscripciones");
      return await res.json();
    } catch {
      return [];
    }
  },

  inscribirTaller: async (payload: TallerInscripcionPayload): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/educacion/inscripciones-talleres`, {
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
    const res = await fetch(`${API_BASE}/api/educacion/solicitudes-espacio`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Error fetching eventos: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Respuesta del servidor no es un arreglo");
    return data.map((item: any) => {
      const p = item.Persona || {};
      const orgName = item.nombre_responsable || [p.nombres, p.apellidos].filter(Boolean).join(' ') || '';
      return {
        id: item.id_solicitud.toString(),
        title: item.motivo || "Evento",
        start: `${item.fecha_uso || item.fecha_solicitada}T${item.hora_inicio || "00:00:00"}`,
        end: `${item.fecha_uso || item.fecha_solicitada}T${item.hora_fin || "23:59:59"}`,
        allDay: !item.hora_inicio,
        extendedProps: {
          organizador: orgName,
          tipoEvento: item.institucion || "Conferencia",
          cedula: p.cedula || item.cedula || ""
        }
      };
    });
  },

  registrarReservaAuditorio: async (payload: any): Promise<{ success: boolean; message: string; data?: any }> => {
    const res = await fetch(`${API_BASE}/api/educacion/solicitudes-espacio`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al crear reserva");
    const data = await res.json();
    return { success: true, message: "Reserva registrada exitosamente", data: data.data };
  },

  actualizarReservaAuditorio: async (id: string, payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/educacion/solicitudes-espacio/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al actualizar reserva");
    return { success: true, message: "Reserva actualizada exitosamente" };
  },

  eliminarReservaAuditorio: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/educacion/solicitudes-espacio/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar reserva");
    return { success: true, message: "Reserva eliminada" };
  },

  // === Auth ===
  login: async (correo: string, password: string): Promise<{ token: string; usuario: any }> => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
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

  getRoles: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/roles`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Error fetching roles");
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch {
      return [];
    }
  },

  getUsuarios: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        console.error("[getUsuarios] Error HTTP:", res.status);
        return [];
      }
      const json = await res.json();
      // El backend devuelve { status: 'success', data: [...] }
      const list: any[] = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
      if (list.length === 0) {
        console.warn("[getUsuarios] Lista vacía. Respuesta del servidor:", JSON.stringify(json).slice(0, 200));
      }
      return list.map((u: any) => ({
        id: u.id_usuario ?? u.id,
        correo: u.correo,
        rol: u.Role?.nombre_rol || "Sin Rol",
        id_rol: u.id_rol,
        estado: u.estado,
        trabajador: u.Trabajador ? {
          id: u.Trabajador.id_trabajador,
          nombre: `${u.Trabajador.nombres || ""} ${u.Trabajador.apellidos || ""}`.trim(),
          cargo: u.Trabajador.CargoTrabajador?.nombre_cargo || "Sin Cargo"
        } : null
      }));
    } catch (e) {
      console.error("[getUsuarios] Excepción:", e);
      return [];
    }
  },

  registrarUsuario: async (payload: any): Promise<{ success: boolean; message: string }> => {
    // Usamos el endpoint de registro con cabeceras de auth para que el backend
    // pueda vincular el trabajador si se proporciona id_trabajador
    const body: any = {
      correo: payload.correo,
      password: payload.password,
      id_rol: payload.id_rol
    };
    if (payload.id_trabajador && payload.id_trabajador !== 0) {
      body.id_trabajador = payload.id_trabajador;
    }
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al registrar usuario");
    return { success: true, message: "Usuario creado exitosamente" };
  },

  actualizarUsuario: async (id: number, payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/auth/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al actualizar usuario");
    return { success: true, message: "Usuario actualizado exitosamente" };
  },

  actualizarTrabajador: async (id: number, payload: any): Promise<{ success: boolean; message: string }> => {
    const body = {
      nombres: payload.nombres || payload.nombre,
      apellidos: payload.apellidos || payload.apellido,
      telefono: payload.telefono,
      correo_personal: payload.correo_personal || payload.correo,
      id_cargo: payload.id_cargo,
      horas_semanales: payload.horas_semanales,
      estado: payload.estado === "Activo"
    };

    const res = await fetch(`${API_BASE}/api/rrhh/trabajadores/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al actualizar trabajador");
    return { success: true, message: data.message };
  },

  getMe: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error obteniendo perfil");
    const json = await res.json();
    return json.data;
  },

  updateMe: async (payload: any): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al actualizar perfil");
    return { success: true, message: "Perfil actualizado exitosamente" };
  },

  // === Dashboard Stats ===
  getDashboardStats: async (): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/api/reportes/dashboard`, {
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
