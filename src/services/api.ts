import axios from 'axios';
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

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const mavetApi = {
  // === Inventario Bóveda ===
  getObras: async (): Promise<Obra[]> => {
    try {
      const res = await axiosInstance.get('/api/obras/obras');
      const list = Array.isArray(res.data) ? res.data : [];
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
        ubicacion: item.ubicacion_actual || "Depósito",
        imagen_url: item.imagen_url || undefined
      }));
    } catch {
      return [];
    }
  },

  crearObra: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post('/api/obras/obras', payload);
      return { success: true, message: "Obra agregada exitosamente al inventario." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear la obra");
    }
  },

  actualizarObra: async (id: string, payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/obras/obras/${id}`, payload);
      return { success: true, message: "Obra actualizada exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar la obra");
    }
  },

  eliminarObra: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/obras/obras/${id}`);
      return { success: true, message: "Obra eliminada del inventario." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar la obra");
    }
  },

  // === Biblioteca ===
  getLibros: async (): Promise<Libro[]> => {
    try {
      const res = await axiosInstance.get('/api/biblioteca/libros');
      return res.data.map((item: any) => {
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
    try {
      await axiosInstance.post('/api/biblioteca/libros', payload);
      return { success: true, message: "Libro registrado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear el libro");
    }
  },

  actualizarLibro: async (id: string, payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/biblioteca/libros/${id}`, payload);
      return { success: true, message: "Libro actualizado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar el libro");
    }
  },

  eliminarLibro: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/biblioteca/libros/${id}`);
      return { success: true, message: "Libro eliminado del inventario." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar el libro");
    }
  },

  registrarPrestamo: async (payload: PrestamoPayload): Promise<{ success: boolean; message: string }> => {
    try {
      const body = {
        id_libro: payload.libroId,
        cedula: payload.cedulaSolicitante,
        nombre: payload.nombreSolicitante,
        estado: payload.estado
      };
      await axiosInstance.post('/api/biblioteca/consultas-sala', body);
      return { success: true, message: "Préstamo registrado exitosamente en el sistema." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al registrar el préstamo");
    }
  },

  devolverLibro: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/biblioteca/libros/${id}/devolver`);
      return { success: true, message: "Libro devuelto exitosamente en el sistema." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al devolver el libro");
    }
  },

  // === Catálogos (rutas públicas — no requieren token) ===
  getArtistas: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/obras/artistas');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { return []; }
  },
  getTecnicas: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/obras/tecnicas');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { return []; }
  },
  getEstadosObra: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/obras/estados');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { return []; }
  },
  getCategoriasObra: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/obras/categorias');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { return []; }
  },
  getAutoresLibro: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/biblioteca/autores');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { return []; }
  },
  getCategoriasLibro: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/biblioteca/categorias');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { return []; }
  },
  getCargos: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/rrhh/cargos');
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch { return []; }
  },

  // === Asistencia y RRHH ===
  getTrabajadores: async (): Promise<Trabajador[]> => {
    try {
      const res = await axiosInstance.get('/api/rrhh/trabajadores');
      const list = Array.isArray(res.data) ? res.data : [];
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
      const res = await axiosInstance.get('/api/rrhh/asistencias');
      const list = Array.isArray(res.data) ? res.data : [];
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
    try {
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

      await axiosInstance.post('/api/rrhh/trabajadores', body);
      return { success: true, message: "Trabajador registrado exitosamente. QR Generado." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al registrar trabajador");
    }
  },

  registrarAsistencia: async (payload: AsistenciaPayload): Promise<{ success: boolean; message: string }> => {
    if (!payload.cedulaTrabajador) throw new Error("Cédula requerida");
    try {
      await axiosInstance.post('/api/rrhh/asistencias', payload);
      return { success: true, message: `Asistencia de ${payload.tipoMovimiento} registrada con éxito.` };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al registrar asistencia");
    }
  },

  // === Registro Público Visitantes / Ingresos ===
  obtenerMotivos: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/visitantes/motivos');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      return [];
    }
  },

  checkVisitante: async (cedula: string): Promise<{ existe: boolean; visitante: any }> => {
    try {
      const res = await axiosInstance.get(`/api/visitantes/ingresos/check/${cedula}`);
      return res.data;
    } catch (e: any) {
      throw new Error("Error comprobando visitante");
    }
  },

  registrarIngreso: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post('/api/visitantes/ingresos', payload);
      return { success: true, message: "Acceso registrado exitosamente." };
    } catch (e: any) {
      throw new Error("Error al registrar ingreso");
    }
  },

  getIngresosStats: async (): Promise<any> => {
    try {
      const res = await axiosInstance.get('/api/visitantes/ingresos/stats');
      return res.data.data;
    } catch (e: any) {
      throw new Error("Error fetching stats");
    }
  },

  // === Talleres ===
  getTalleres: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/educacion/talleres');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      return [];
    }
  },

  crearTaller: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post('/api/educacion/talleres', payload);
      return { success: true, message: "Taller creado correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear taller");
    }
  },

  getInstructores: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/educacion/instructores');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      return [];
    }
  },

  getEspaciosMuseo: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/educacion/espacios');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      return [];
    }
  },

  getInscripcionesTaller: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/educacion/inscripciones-talleres');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      return [];
    }
  },

  inscribirTaller: async (payload: TallerInscripcionPayload): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post('/api/educacion/inscripciones-talleres', payload);
      return { success: true, message: "Alumno inscrito correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al inscribir alumno");
    }
  },

  // === Auditorio ===
  getEventos: async (): Promise<EventoAuditorio[]> => {
    try {
      const res = await axiosInstance.get('/api/educacion/solicitudes-espacio');
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);

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
        }
      });
    } catch (e: any) {
      throw new Error(`Error fetching eventos: ${e.message}`);
    }
  },

  registrarReservaAuditorio: async (payload: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const res = await axiosInstance.post('/api/educacion/solicitudes-espacio', payload);
      return { success: true, message: "Reserva registrada exitosamente", data: res.data.data };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear reserva");
    }
  },

  actualizarReservaAuditorio: async (id: string, payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/educacion/solicitudes-espacio/${id}`, payload);
      return { success: true, message: "Reserva actualizada exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar reserva");
    }
  },

  eliminarReservaAuditorio: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/educacion/solicitudes-espacio/${id}`);
      return { success: true, message: "Reserva eliminada" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar reserva");
    }
  },

  // === Auth ===
  login: async (correo: string, password: string): Promise<{ token: string; usuario: any }> => {
    try {
      const res = await axiosInstance.post('/api/auth/login', { correo, password });
      return res.data.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Credenciales incorrectas");
    }
  },

  getRoles: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/auth/roles');
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch {
      return [];
    }
  },

  getUsuarios: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/auth');
      const json = res.data;
      const list: any[] = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
      if (list.length === 0) {
        console.warn("[getUsuarios] Lista vacía.");
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
    try {
      const body: any = {
        correo: payload.correo,
        password: payload.password,
        id_rol: payload.id_rol
      };
      if (payload.id_trabajador && payload.id_trabajador !== 0) {
        body.id_trabajador = payload.id_trabajador;
      }
      await axiosInstance.post('/api/auth/register', body);
      return { success: true, message: "Usuario creado exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al registrar usuario");
    }
  },

  actualizarUsuario: async (id: number, payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/auth/${id}`, payload);
      return { success: true, message: "Usuario actualizado exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar usuario");
    }
  },

  actualizarTrabajador: async (id: number, payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      const body = {
        nombres: payload.nombres || payload.nombre,
        apellidos: payload.apellidos || payload.apellido,
        telefono: payload.telefono,
        correo_personal: payload.correo_personal || payload.correo,
        id_cargo: payload.id_cargo,
        horas_semanales: payload.horas_semanales,
        estado: payload.estado === "Activo"
      };
      const res = await axiosInstance.put(`/api/rrhh/trabajadores/${id}`, body);
      return { success: true, message: res.data.message || "Trabajador actualizado" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar trabajador");
    }
  },

  getMe: async (): Promise<any> => {
    try {
      const res = await axiosInstance.get('/api/auth/me');
      return res.data.data;
    } catch (e: any) {
      throw new Error("Error obteniendo perfil");
    }
  },

  updateMe: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put('/api/auth/me', payload);
      return { success: true, message: "Perfil actualizado exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar perfil");
    }
  },

  // === Dashboard Stats ===
  getDashboardStats: async (): Promise<any> => {
    try {
      const res = await axiosInstance.get('/api/reportes/dashboard');
      return res.data.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
};
