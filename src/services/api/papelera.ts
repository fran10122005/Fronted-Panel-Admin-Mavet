import { axiosInstance } from "./client";

interface PapeleraParams {
  page?: number;
  limit?: number;
  tipo?: string;
  search?: string;
}

interface PapeleraResponse {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const papelera = {
  getPapeleraGlobal: async (params: PapeleraParams = {}): Promise<PapeleraResponse> => {
    try {
      const res = await axiosInstance.get("/api/papelera", { params });
      return {
        items: Array.isArray(res.data?.items) ? res.data.items : [],
        total: res.data?.total ?? 0,
        page: res.data?.page ?? 1,
        limit: res.data?.limit ?? 20,
        totalPages: res.data?.totalPages ?? 1,
      };
    } catch {
      return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
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
