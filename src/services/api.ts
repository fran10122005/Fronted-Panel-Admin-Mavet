import axios from 'axios';
import { 
  Artista,
  Obra, 
  Libro, 
  PrestamoPayload, 
  AsistenciaPayload, 
  TallerInscripcionPayload,
  EventoAuditorio,
  Trabajador,
  RegistroAsistencia,
  Prestamo,
  TopVisitante,
  Usuario,
  Rol,
  Cargo,
  UsuarioPayload,
  TrabajadorPayload
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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export const mavetApi = {
  // === Inventario Bóveda ===
  getObras: async (page?: number, limit?: number): Promise<{ data: Obra[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get('/api/obras/obras', { params });
      const json = res.data;
      const list = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
      const meta = json?.meta || { totalItems: list.length, totalPages: 1, currentPage: 1 };
      return {
        data: list.map((item: any) => ({
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
        })),
        totalItems: meta.totalItems,
        totalPages: meta.totalPages,
        currentPage: meta.currentPage
      };
    } catch {
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  crearObra: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      const isFormData = payload instanceof FormData;
      await axiosInstance.post('/api/obras/obras', payload, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {}
      });
      return { success: true, message: "Obra agregada exitosamente al inventario." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear la obra");
    }
  },

  actualizarObra: async (id: string, payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      const isFormData = payload instanceof FormData;
      await axiosInstance.put(`/api/obras/obras/${id}`, payload, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {}
      });
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

  // === RUTAS PÚBLICAS (Auto-Ingreso QR) ===

  obtenerMotivosPublicos: async (): Promise<any[]> => {
    try {
      const res = await axios.get(`${API_BASE}/api/visitantes/motivos`);
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    } catch {
      return [];
    }
  },

  getAgendaPublica: async (): Promise<any[]> => {
    try {
      const res = await axios.get(`${API_BASE}/api/public/agenda`);
      return res.data.data || res.data || [];
    } catch {
      return [];
    }
  },

  checkVisitantePublico: async (cedula: string): Promise<{ existe: boolean, nombre: string | null }> => {
    try {
      const res = await axios.get(`${API_BASE}/api/publico/visitantes/check/${cedula}`);
      return res.data;
    } catch {
      return { existe: false, nombre: null };
    }
  },

  registrarAutoIngreso: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axios.post(`${API_BASE}/api/publico/visitantes/ingreso`, payload);
      return { success: true, message: res.data.message };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al auto-registrar ingreso');
    }
  },

  // === Biblioteca ===
  getLibros: async (page?: number, limit?: number): Promise<{ data: Libro[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get('/api/biblioteca/libros', { params });
      const json = res.data;
      const list = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
      const meta = json?.meta || { totalItems: list.length, totalPages: 1, currentPage: 1 };
      return {
        data: list.map((item: any) => {
          const primerAutor = item.AutorLibros?.[0];
          return {
            id:                  item.id_libro.toString(),
            unidad:              item.unidad              || "",
            cuota:               item.cuota               || "",
            titulo:              item.titulo              || "",
            autor:               item.autor || (primerAutor ? `${primerAutor.nombre || ""} ${primerAutor.apellido || ""}`.trim() : "Desconocido"),
            estante:             item.estante             || "",
            ano_libro:           item.ano_libro           || "",
            id_categoria:        item.id_categoria,
            categoria:           item.CategoriaLibro?.nombre_categoria || "",
            cantidad_total:      item.cantidad_total      ?? 0,
            cantidad_disponible: item.cantidad_disponible ?? 0,
            estado:              item.estado              || "Aprobado",
            fecha_ingreso:       item.fecha_ingreso       || ""
          };
        }),
        totalItems: meta.totalItems,
        totalPages: meta.totalPages,
        currentPage: meta.currentPage
      };
    } catch {
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
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

  getPrestamosBiblioteca: async (): Promise<Prestamo[]> => {
    try {
      const res = await axiosInstance.get('/api/biblioteca/consultas-sala');
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      return list.map((item: any) => ({
        id: item.id_prestamo?.toString() || item.id?.toString(),
        libroId: item.id_libro?.toString() || item.libroId,
        libroTitulo: item.Libro?.titulo || item.libroTitulo || "",
        libroUnidad: item.Libro?.unidad || item.libroUnidad || "",
        cedulaSolicitante: item.cedula || item.cedulaSolicitante || "",
        nombreSolicitante: item.nombre || item.nombreSolicitante || "",
        fechaPrestamo: item.fecha_prestamo || item.fechaPrestamo || "",
        fechaDevolucion: item.fecha_devolucion || item.fechaDevolucion,
        estado: item.estado?.toUpperCase() === "DEVUELTO" || item.estado === "Devuelto" ? "DEVUELTO" : "ACTIVO"
      }));
    } catch {
      return [];
    }
  },

  // === Catálogos (rutas públicas — no requieren token) ===
  getArtistas: async (): Promise<Artista[]> => {
    try {
      const res = await axiosInstance.get('/api/obras/artistas');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { return []; }
  },
  crearArtista: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post('/api/obras/artistas', payload);
      return { success: true, message: "Artista registrado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear artista");
    }
  },
  actualizarArtista: async (id: number, payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/obras/artistas/${id}`, payload);
      return { success: true, message: "Artista actualizado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar artista");
    }
  },
  eliminarArtista: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/obras/artistas/${id}`);
      return { success: true, message: "Artista eliminado." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar artista");
    }
  },
  buscarArtista: async (query: string): Promise<Artista[]> => {
    try {
      const res = await axiosInstance.get('/api/obras/artistas/buscar', { params: { q: query } });
      const data = res.data?.data || [];
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  },
  buscarPersona: async (query: string): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/personas/buscar', { params: { q: query } });
      return res.data?.data || [];
    } catch { return []; }
  },
  getTecnicas: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/obras/tecnicas');
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { return []; }
  },
  crearTecnica: async (payload: { nombre_tecnica: string; descripcion?: string }): Promise<any> => {
    const res = await axiosInstance.post('/api/obras/tecnicas', payload);
    return res.data?.data || res.data;
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

  // === Asistencia y RRHH ===
  getTrabajadores: async (page?: number, limit?: number): Promise<{ data: Trabajador[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get('/api/rrhh/trabajadores', { params });
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      const meta = res.data?.meta || { totalItems: list.length, totalPages: 1, currentPage: 1 };
      return {
        data: list.map((item: any) => ({
          cedula: item.cedula,
          nombre: item.nombres,
          apellido: item.apellidos,
          telefono: item.telefono || "",
          correo: item.correo_personal || "",
          cargo: item.CargoTrabajador?.nombre_cargo || "Sin cargo",
          horas_semanales: item.horas_semanales || 0,
          estado: (item.estado === true || item.estado === "Activo") ? "Activo" : "Inactivo",
          id: item.id_trabajador
        })),
        totalItems: meta.totalItems,
        totalPages: meta.totalPages,
        currentPage: meta.currentPage
      };
    } catch (e) {
      console.error(e);
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  getAsistencia: async (page?: number, limit?: number): Promise<{ data: RegistroAsistencia[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get('/api/rrhh/asistencias', { params });
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      const meta = res.data?.meta || { totalItems: list.length, totalPages: 1, currentPage: 1 };
      return {
        data: list.map((item: any) => {
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
        }),
        totalItems: meta.totalItems,
        totalPages: meta.totalPages,
        currentPage: meta.currentPage
      };
    } catch (e) {
      console.error(e);
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  registrarTrabajador: async (payload: TrabajadorPayload): Promise<{ success: boolean; message: string }> => {
    try {
      const body: any = {
        cedula: payload.cedula,
        nombres: payload.nombres || payload.nombre,
        apellidos: payload.apellidos || payload.apellido,
        telefono: payload.telefono,
        correo_personal: payload.correo_personal || payload.correo,
        id_cargo: payload.id_cargo,
        horas_semanales: payload.horas_semanales,
        estado: payload.estado === "Activo"
      };
      if (payload.direccion !== undefined) body.direccion = payload.direccion;
      if (payload.fecha_nacimiento !== undefined) body.fecha_nacimiento = payload.fecha_nacimiento;
      if (payload.fecha_ingreso !== undefined) body.fecha_ingreso = payload.fecha_ingreso;

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
    } catch {
      throw new Error("Error comprobando visitante");
    }
  },

  getTodosIngresos: async (page?: number, limit?: number): Promise<{ data: any[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get('/api/visitantes/ingresos', { params });
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      const meta = res.data?.meta || { totalItems: list.length, totalPages: 1, currentPage: 1 };
      return { data: list, totalItems: meta.totalItems, totalPages: meta.totalPages, currentPage: meta.currentPage };
    } catch {
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  registrarIngreso: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post('/api/visitantes/ingresos', payload);
      return { success: true, message: "Acceso registrado exitosamente." };
    } catch {
      throw new Error("Error al registrar ingreso");
    }
  },

  getIngresosStats: async (): Promise<any> => {
    try {
      const res = await axiosInstance.get('/api/visitantes/ingresos/stats');
      return res.data.data;
    } catch {
      throw new Error("Error fetching stats");
    }
  },

  getTopVisitantes: async (month?: number, year?: number): Promise<TopVisitante[]> => {
    try {
      const params: any = {};
      if (month !== undefined) params.mes = month;
      if (year !== undefined) params.anio = year;
      const res = await axiosInstance.get('/api/visitantes/ingresos/top', { params });
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      return list.map((item: any) => ({
        cedula: item.cedula || "",
        nombre: item.nombre || item.nombres || "Desconocido",
        totalVisitas: item.total_visitas || item.totalVisitas || 0,
        ultimaVisita: item.ultima_visita || item.ultimaVisita || ""
      }));
    } catch {
      return [];
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
  actualizarTaller: async (id: number, payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/educacion/talleres/${id}`, payload);
      return { success: true, message: "Taller actualizado correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar taller");
    }
  },
  eliminarTaller: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/educacion/talleres/${id}`);
      return { success: true, message: "Taller eliminado correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar taller");
    }
  },

  // === Inventario de Talleres ===
  getInventarioTalleres: async (page?: number, limit?: number): Promise<{ data: any[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get('/api/educacion/talleres/inventario', { params });
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      const meta = res.data?.meta || { totalItems: list.length, totalPages: 1, currentPage: 1 };
      return { data: list, totalItems: meta.totalItems, totalPages: meta.totalPages, currentPage: meta.currentPage };
    } catch {
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  crearInventarioTaller: async (payload: { nombre: string; descripcion: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post('/api/educacion/talleres/inventario', payload);
      return { success: true, message: "Taller agregado al inventario." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear taller en inventario");
    }
  },

  actualizarInventarioTaller: async (id: number, payload: { nombre: string; descripcion: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/educacion/talleres/inventario/${id}`, payload);
      return { success: true, message: "Taller actualizado en el inventario." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar taller en inventario");
    }
  },

  eliminarInventarioTaller: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/educacion/talleres/inventario/${id}`);
      return { success: true, message: "Taller eliminado del inventario." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar taller del inventario");
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
  crearInstructor: async (payload: { id_persona: number; profesion?: string; especialidad?: string }): Promise<any> => {
    try {
      const res = await axiosInstance.post('/api/educacion/instructores', payload);
      return res.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear instructor");
    }
  },
  actualizarInstructor: async (id: number, payload: { profesion?: string; especialidad?: string }): Promise<any> => {
    try {
      const res = await axiosInstance.put(`/api/educacion/instructores/${id}`, payload);
      return res.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar instructor");
    }
  },
  eliminarInstructor: async (id: number): Promise<any> => {
    try {
      const res = await axiosInstance.delete(`/api/educacion/instructores/${id}`);
      return res.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar instructor");
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

  getInscripcionesPorTaller: async (id: number): Promise<any[]> => {
    try {
      const res = await axiosInstance.get(`/api/educacion/inscripciones-talleres/taller/${id}`);
      return Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      return [];
    }
  },

  exportInscripciones: async (id: number, format: string): Promise<void> => {
    try {
      const res = await axiosInstance.get(`/api/educacion/inscripciones-talleres/taller/${id}/export?format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Inscripciones_Taller_${id}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      throw new Error("Error al exportar inscripciones");
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

  getRoles: async (): Promise<Rol[]> => {
    try {
      const res = await axiosInstance.get('/api/auth/roles');
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch {
      return [];
    }
  },

  getCargos: async (): Promise<Cargo[]> => {
    try {
      const res = await axiosInstance.get('/api/rrhh/cargos');
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch { return []; }
  },

  getUsuarios: async (): Promise<Usuario[]> => {
    try {
      const res = await axiosInstance.get('/api/auth');
      const json = res.data;
      const list: any[] = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
      return list.map((u: any) => ({
        id: u.id_usuario ?? u.id,
        correo: u.correo,
        rol: u.Role?.nombre_rol || "Sin Rol",
        estado: u.estado,
        id_trabajador: u.id_trabajador ?? u.Trabajador?.id_trabajador,
        trabajador: u.Trabajador ? {
          nombre: `${u.Trabajador.nombres || ""} ${u.Trabajador.apellidos || ""}`.trim(),
          cargo: u.Trabajador.CargoTrabajador?.nombre_cargo || "Sin Cargo"
        } : undefined
      }));
    } catch (e) {
      console.error("[getUsuarios] Excepción:", e);
      return [];
    }
  },

  registrarUsuario: async (payload: UsuarioPayload): Promise<{ success: boolean; message: string }> => {
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

  actualizarUsuario: async (id: number, payload: UsuarioPayload): Promise<{ success: boolean; message: string }> => {
    try {
      const body: any = {
        correo: payload.correo,
        id_rol: payload.id_rol,
        estado: payload.estado
      };
      if (payload.id_trabajador && payload.id_trabajador !== 0) {
        body.id_trabajador = payload.id_trabajador;
      }
      await axiosInstance.put(`/api/auth/${id}`, body);
      return { success: true, message: "Usuario actualizado exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar usuario");
    }
  },

  resetPasswordUsuario: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.post(`/api/auth/reset-password/${id}`);
      return { success: true, message: res.data?.message || "Correo de restablecimiento enviado" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al restablecer contraseña");
    }
  },

  actualizarTrabajador: async (id: number, payload: TrabajadorPayload): Promise<{ success: boolean; message: string }> => {
    try {
      const body: any = {
        nombres: payload.nombres || payload.nombre,
        apellidos: payload.apellidos || payload.apellido,
        telefono: payload.telefono,
        correo_personal: payload.correo_personal || payload.correo,
        id_cargo: payload.id_cargo,
        horas_semanales: payload.horas_semanales,
        estado: payload.estado === "Activo"
      };
      if (payload.direccion !== undefined) body.direccion = payload.direccion;
      if (payload.fecha_nacimiento !== undefined) body.fecha_nacimiento = payload.fecha_nacimiento;
      if (payload.fecha_ingreso !== undefined) body.fecha_ingreso = payload.fecha_ingreso;
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
    } catch {
      throw new Error("Error obteniendo perfil");
    }
  },

  updateMe: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      const body: any = {};
      if (payload.nombres !== undefined) body.nombres = payload.nombres;
      if (payload.apellidos !== undefined) body.apellidos = payload.apellidos;
      if (payload.telefono !== undefined) body.telefono = payload.telefono;
      if (payload.correo_personal !== undefined) body.correo_personal = payload.correo_personal;
      await axiosInstance.put('/api/auth/me', body);
      return { success: true, message: "Perfil actualizado exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar perfil");
    }
  },

  cambiarPassword: async (payload: { password_actual: string; password_nuevo: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.put('/api/auth/me/password', payload);
      return { success: true, message: res.data?.message || "Contraseña actualizada exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al cambiar la contraseña");
    }
  },

  subirFotoPerfil: async (file: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append("foto", file);
      const res = await axiosInstance.post('/api/auth/me/foto', formData);
      return { url: res.data?.url || res.data?.data?.url || "" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al subir la foto");
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
