import { axiosInstance, extractList } from "./client";
import type { EventoAuditorio } from "../../types";

export const auditorio = {
  getEventos: async (): Promise<EventoAuditorio[]> => {
    try {
      const res = await axiosInstance.get("/api/educacion/solicitudes-espacio");
      const data = extractList(res);
      return data.map((item: any) => {
        const p = item.Persona || {};
        const orgName = item.nombre_responsable || [p.nombres, p.apellidos].filter(Boolean).join(" ") || "";
        return {
          id: item.id_solicitud.toString(),
          codigo_reserva: item.codigo_reserva || "",
          title: item.motivo || "Evento",
          start: `${item.fecha_uso || item.fecha_solicitada}T${item.hora_inicio || "00:00:00"}`,
          end: `${item.fecha_uso || item.fecha_solicitada}T${item.hora_fin || "23:59:59"}`,
          allDay: !item.hora_inicio,
          extendedProps: {
            organizador: orgName,
            tipoEvento: item.institucion || "Conferencia",
            cedula: p.cedula || item.cedula || "",
            estado: item.estado || "Pendiente",
          },
        };
      });
    } catch (e: any) {
      throw new Error(`Error fetching eventos: ${e.message}`);
    }
  },

  registrarReservaAuditorio: async (payload: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const res = await axiosInstance.post("/api/educacion/solicitudes-espacio", payload);
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
};
