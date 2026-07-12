import { axiosInstance, extractPagination, extractList } from "./client";

export const talleres = {
  getTalleres: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/educacion/talleres");
      return extractList(res);
    } catch {
      return [];
    }
  },

  crearTaller: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post("/api/educacion/talleres", payload);
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

  getSesionesTaller: async (id_taller: number | string): Promise<any[]> => {
    try {
      const res = await axiosInstance.get(`/api/educacion/sesiones/taller/${id_taller}`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch {
      return [];
    }
  },

  crearSesionTaller: async (id_taller: number | string, payload: { fecha: string; tema_impartido: string }): Promise<any> => {
    try {
      const res = await axiosInstance.post(`/api/educacion/sesiones/taller/${id_taller}`, payload);
      return res.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear sesión");
    }
  },

  getAsistenciaSesion: async (id_sesion: number | string): Promise<any[]> => {
    try {
      const res = await axiosInstance.get(`/api/educacion/sesiones/${id_sesion}/asistencia`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch {
      return [];
    }
  },

  guardarAsistenciaSesion: async (id_sesion: number | string, asistencias: { id_alumno: number; asistio: boolean }[]): Promise<any> => {
    try {
      const res = await axiosInstance.put(`/api/educacion/sesiones/${id_sesion}/asistencia`, { asistencias });
      return res.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al guardar asistencia");
    }
  },

  getMetricasTaller: async (id_taller: number | string): Promise<any> => {
    try {
      const res = await axiosInstance.get(`/api/educacion/sesiones/taller/${id_taller}/metricas`);
      return res.data?.data;
    } catch {
      return null;
    }
  },

  getInventarioTalleres: async (page?: number, limit?: number): Promise<{ data: any[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get("/api/educacion/talleres/inventario", { params });
      const list = extractList(res);
      return extractPagination(res, list);
    } catch {
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  crearInventarioTaller: async (payload: { nombre: string; descripcion: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post("/api/educacion/talleres/inventario", payload);
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
      const res = await axiosInstance.get("/api/educacion/instructores");
      return extractList(res);
    } catch {
      return [];
    }
  },

  crearInstructor: async (payload: { id_persona: number; profesion?: string; especialidad?: string }): Promise<any> => {
    try {
      const res = await axiosInstance.post("/api/educacion/instructores", payload);
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
      const res = await axiosInstance.get("/api/educacion/espacios");
      const list = extractList(res).map((item: any) => ({
        id_espacio: item.id_espacio,
        codigo_espacio: item.codigo_espacio || "",
        nombre_espacio: item.nombre || item.nombre_espacio,
        capacidad_maxima: item.capacidad || item.capacidad_maxima,
        descripcion: item.descripcion || "",
      }));
      return list;
    } catch {
      return [];
    }
  },

  crearEspacio: async (payload: { nombre_espacio: string; capacidad_maxima?: number; descripcion?: string; codigo_espacio?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post("/api/educacion/espacios", {
        codigo_espacio: payload.codigo_espacio,
        nombre: payload.nombre_espacio,
        capacidad: payload.capacidad_maxima,
        descripcion: payload.descripcion,
      });
      return { success: true, message: "Espacio creado correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear espacio");
    }
  },

  actualizarEspacio: async (id: number, payload: { nombre_espacio?: string; capacidad_maxima?: number; descripcion?: string; codigo_espacio?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/educacion/espacios/${id}`, {
        codigo_espacio: payload.codigo_espacio,
        nombre: payload.nombre_espacio,
        capacidad: payload.capacidad_maxima,
        descripcion: payload.descripcion,
      });
      return { success: true, message: "Espacio actualizado correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar espacio");
    }
  },

  eliminarEspacio: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/educacion/espacios/${id}`);
      return { success: true, message: "Espacio eliminado correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar espacio");
    }
  },

  getInscripcionesTaller: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/educacion/inscripciones-talleres");
      return extractList(res);
    } catch {
      return [];
    }
  },

  inscribirTaller: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post("/api/educacion/inscripciones-talleres", payload);
      return { success: true, message: "Alumno inscrito correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al inscribir alumno");
    }
  },

  getInscripcionesPorTaller: async (id: number): Promise<any[]> => {
    try {
      const res = await axiosInstance.get(`/api/educacion/inscripciones-talleres/taller/${id}`);
      return extractList(res);
    } catch {
      return [];
    }
  },

  exportInscripciones: async (id: number, format: string): Promise<void> => {
    try {
      const res = await axiosInstance.get(`/api/educacion/inscripciones-talleres/taller/${id}/export?format=${format}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Inscripciones_Taller_${id}_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      throw new Error("Error al exportar inscripciones");
    }
  },

  eliminarInscripcion: async (idInscripcion: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/educacion/inscripciones-talleres/${idInscripcion}`);
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar inscripción");
    }
  },
};
