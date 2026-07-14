import { axiosInstance } from "./client";

export const papelera = {
  getPapeleraGlobal: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/papelera");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch {
      return [];
    }
  },

  restaurarDePapelera: async (tipo: string, id: number | string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.post("/api/papelera/restaurar", { tipo, id });
      return { success: true, message: res.data.message || "Registro restaurado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al restaurar de la papelera");
    }
  },

  eliminarDefinitivo: async (tipo: string, id: number | string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.delete("/api/papelera/eliminar", { data: { tipo, id } });
      return { success: true, message: res.data.message || "Registro eliminado definitivamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar definitivamente");
    }
  },

  vaciarPapelera: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.delete("/api/papelera/vaciar");
      return { success: true, message: res.data.message || "Papelera vaciada correctamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al vaciar la papelera");
    }
  },
};
