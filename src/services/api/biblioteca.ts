import { axiosInstance, extractPagination, extractList } from "./client";
import type { Libro, PrestamoPayload, Prestamo, ConsultasFiltradasResponse, EstadisticasBiblioteca } from "../../types";

export const biblioteca = {
  getLibros: async (page?: number, limit?: number): Promise<{ data: Libro[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get("/api/biblioteca/libros", { params });
      const list = extractList(res).map((item: any) => {
        const primerAutor = item.AutorLibros?.[0] || item.AutorLibro?.[0] || item.autores_libros?.[0];
        return {
          id: item.id_libro.toString(),
          unidad: item.unidad || "",
          cuota: item.cuota || "",
          titulo: item.titulo || "",
          autor:
            item.autor ||
            (primerAutor ? `${primerAutor.nombre || ""} ${primerAutor.apellido || ""}`.trim() : "Desconocido"),
          id_autor: primerAutor?.id_autor,
          estante: item.estante || "",
          ano_libro: item.ano_libro || "",
          id_categoria: item.id_categoria,
          categoria: item.CategoriaLibro?.nombre_categoria || "",
          cantidad_total: item.cantidad_total ?? 0,
          cantidad_disponible: item.cantidad_disponible ?? 0,
          estado: item.estado || "Aprobado",
          fecha_ingreso: item.fecha_ingreso || "",
        };
      });
      return extractPagination(res, list);
    } catch {
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  crearLibro: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post("/api/biblioteca/libros", payload);
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
        estado: payload.estado,
      };
      await axiosInstance.post("/api/biblioteca/consultas-sala", body);
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
      const res = await axiosInstance.get("/api/biblioteca/consultas-sala");
      const list = extractList(res);
      return list.map((item: any) => ({
        id: item.id_consulta?.toString() || item.id_prestamo?.toString() || item.id?.toString(),
        libroId: item.id_libro?.toString() || item.libroId,
        libroTitulo: item.Libro?.titulo || item.libroTitulo || "",
        libroUnidad: item.Libro?.unidad || item.libroUnidad || "",
        cedulaSolicitante:
          item.Persona?.cedula || item.cedula || item.cedulaSolicitante || "",
        nombreSolicitante:
          item.Persona
            ? `${item.Persona.nombres || ""} ${item.Persona.apellidos || ""}`.trim()
            : item.nombre || item.nombreSolicitante || "",
        fechaPrestamo: item.hora_entrega
          ? new Date(item.hora_entrega).toISOString()
          : item.fecha_prestamo || item.fechaPrestamo || "",
        fechaDevolucion: item.hora_devolucion
          ? new Date(item.hora_devolucion).toISOString()
          : item.fecha_devolucion || item.fechaDevolucion,
        estado:
          item.estado?.toUpperCase() === "DEVUELTO" || item.estado === "Devuelto" ? "DEVUELTO" : "ACTIVO",
      }));
    } catch {
      return [];
    }
  },

  getConsultasFiltradas: async (params: {
    periodo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    id_libro?: string;
    id_persona?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }): Promise<ConsultasFiltradasResponse> => {
    try {
      const res = await axiosInstance.get("/api/biblioteca/consultas-sala/filtradas", { params });
      return res.data;
    } catch {
      return { data: [], meta: { totalItems: 0, totalPages: 1, currentPage: 1 } };
    }
  },

  getEstadisticasBiblioteca: async (top: number = 10): Promise<EstadisticasBiblioteca> => {
    try {
      const res = await axiosInstance.get("/api/biblioteca/consultas-sala/estadisticas", {
        params: { top },
      });
      return res.data;
    } catch {
      return {
        topLibros: [],
        topLectores: [],
        totalLectores: 0,
        totales: { hoy: 0, semana: 0, mes: 0, activas: 0, devueltas: 0 },
      };
    }
  },

  getAutoresLibro: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/biblioteca/autores");
      return extractList(res);
    } catch {
      return [];
    }
  },

  crearAutorLibro: async (payload: { nombre: string; apellido?: string }): Promise<any> => {
    const res = await axiosInstance.post("/api/biblioteca/autores", payload);
    return res.data?.data || res.data;
  },

  getCategoriasLibro: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/biblioteca/categorias");
      return extractList(res);
    } catch {
      return [];
    }
  },

  crearCategoriaLibro: async (payload: { nombre_categoria: string }): Promise<any> => {
    const res = await axiosInstance.post("/api/biblioteca/categorias", payload);
    return res.data?.data || res.data;
  },

  actualizarCategoriaLibro: async (id: string, payload: { nombre_categoria?: string; ubicacion_estante?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/biblioteca/categorias/${id}`, payload);
      return { success: true, message: "Categoría actualizada exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar categoría");
    }
  },

  eliminarCategoriaLibro: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/biblioteca/categorias/${id}`);
      return { success: true, message: "Categoría eliminada." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar categoría");
    }
  },
};
