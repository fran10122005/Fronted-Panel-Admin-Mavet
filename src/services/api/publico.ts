import axios from "axios";
import { API_BASE } from "./client";

export const publico = {
  obtenerMotivosPublicos: async (): Promise<any[]> => {
    try {
      const res = await axios.get(`${API_BASE}/api/visitantes/motivos`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
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

  checkVisitantePublico: async (cedula: string): Promise<{ existe: boolean; nombre: string | null; talleres?: any[] }> => {
    try {
      const res = await axios.get(`${API_BASE}/api/publico/visitantes/check/${cedula}`);
      return res.data;
    } catch {
      return { existe: false, nombre: null, talleres: [] };
    }
  },

  registrarAutoIngreso: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axios.post(`${API_BASE}/api/publico/visitantes/ingreso`, payload);
      return { success: true, message: res.data.message };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al auto-registrar ingreso");
    }
  },
};
