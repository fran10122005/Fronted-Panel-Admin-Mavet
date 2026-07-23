import { axiosInstance, extractPagination, extractList } from "./client";
import type { TopVisitante } from "../../types";

export const recepcion = {
  obtenerMotivos: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/visitantes/motivos");
      return extractList(res);
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

  getTodosIngresos: async (params?: { page?: number; limit?: number; fecha?: string; id_solicitud?: string; q?: string; id_motivo?: string; fecha_desde?: string; fecha_hasta?: string }): Promise<{ data: any[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const res = await axiosInstance.get("/api/visitantes/ingresos", { params });
      const list = extractList(res);
      return extractPagination(res, list);
    } catch {
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  registrarIngreso: async (payload: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const res = await axiosInstance.post("/api/visitantes/ingresos", payload);
      return { success: true, message: "Acceso registrado exitosamente.", data: res.data.data };
    } catch (error: any) {
      console.error("=== registrarIngreso ERROR ===");
      console.error("Status:", error.response?.status);
      console.error("Response body:", JSON.stringify(error.response?.data, null, 2));
      console.error("Payload sent:", JSON.stringify(payload, null, 2));
      const serverMsg = error.response?.data?.message || error.response?.data?.error || JSON.stringify(error.response?.data);
      throw new Error(serverMsg || "Error al registrar ingreso");
    }
  },

  getIngresosStats: async (): Promise<any> => {
    try {
      const res = await axiosInstance.get("/api/visitantes/ingresos/stats");
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
      const res = await axiosInstance.get("/api/visitantes/ingresos/top", { params });
      const list = extractList(res);
      return list.map((item: any) => ({
        cedula: item.cedula || "",
        nombre: item.nombre || item.nombres || "Desconocido",
        totalVisitas: item.total_visitas || item.totalVisitas || 0,
        ultimaVisita: item.ultima_visita || item.ultimaVisita || "",
      }));
    } catch {
      return [];
    }
  },
};
