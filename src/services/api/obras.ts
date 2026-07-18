import { axiosInstance, extractPagination, extractList } from "./client";
import type { Artista, Obra } from "../../types";

export const obras = {
  getObras: async (page?: number, limit?: number): Promise<{ data: Obra[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get("/api/obras/obras", { params });
      const list = extractList(res).map((item: any) => ({
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
        imagen_url: item.imagen_url || undefined,
        clasificacion_patrimonial: item.clasificacion_patrimonial || "no_clasificado",
      }));
      return extractPagination(res, list);
    } catch {
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  crearObra: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post("/api/obras/obras", payload);
      return { success: true, message: "Obra agregada exitosamente al inventario." };
    } catch (e: any) {
      console.error("[crearObra]", e.response?.data);
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

  getArtistas: async (): Promise<Artista[]> => {
    try {
      const res = await axiosInstance.get("/api/obras/artistas");
      return extractList(res);
    } catch {
      return [];
    }
  },

  crearArtista: async (payload: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const res = await axiosInstance.post("/api/obras/artistas", payload);
      return { success: true, message: "Artista registrado exitosamente.", data: res.data?.data };
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
      const res = await axiosInstance.get("/api/obras/artistas/buscar", { params: { q: query } });
      const data = res.data?.data || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  buscarPersona: async (query: string): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/personas/buscar", { params: { q: query } });
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  getTecnicas: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/obras/tecnicas");
      return extractList(res);
    } catch {
      return [];
    }
  },

  crearTecnica: async (payload: { nombre_tecnica: string; descripcion?: string }): Promise<any> => {
    const res = await axiosInstance.post("/api/obras/tecnicas", payload);
    return res.data?.data || res.data;
  },

  getEstadosObra: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/obras/estados");
      return extractList(res);
    } catch {
      return [];
    }
  },

  getCategoriasObra: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/obras/categorias");
      return extractList(res);
    } catch {
      return [];
    }
  },

  crearEstado: async (payload: { nombre_estado: string; descripcion?: string }): Promise<any> => {
    const res = await axiosInstance.post("/api/obras/estados", payload);
    return res.data?.data || res.data;
  },

  crearCategoria: async (payload: { nombre_categoria: string; descripcion?: string }): Promise<any> => {
    const res = await axiosInstance.post("/api/obras/categorias", payload);
    return res.data?.data || res.data;
  },

  getHistorialObra: async (id: string): Promise<{ data: any[]; meta?: any }> => {
    const res = await axiosInstance.get(`/api/obras/obras/${id}/historial`);
    return res.data;
  },

  registrarMovimientoObra: async (id: string, payload: any): Promise<any> => {
    const res = await axiosInstance.post(`/api/obras/obras/${id}/historial`, payload);
    return res.data?.data;
  },
};
