import { axiosInstance, extractList } from "./client";
import type { EventoAuditorio } from "../../types";

const mapEvento = (item: any): EventoAuditorio => {
  const p = item.Persona || {};
  const orgName = item.nombre_responsable || [p.nombres, p.apellidos].filter(Boolean).join(" ") || "";
  const ap = item.Usuario ? `${item.Usuario.nombre_usuario || item.Usuario.correo || ""}` : "";
  return {
    id: item.id_solicitud.toString(),
    codigo_reserva: item.codigo_reserva || "",
    numero_expediente: item.numero_expediente || "",
    title: item.motivo || "Evento",
    start: `${item.fecha_uso || item.fecha_solicitada}T${item.hora_inicio || "00:00:00"}`,
    end: `${item.fecha_uso || item.fecha_solicitada}T${item.hora_fin || "23:59:59"}`,
    allDay: !item.hora_inicio,
    extendedProps: {
      organizador: orgName,
      tipoEvento: item.TipoEvento?.nombre || item.institucion || "Conferencia",
      cedula: p.cedula || item.cedula || "",
      estado: item.estado || "Pendiente",
      estatus_aprobacion: item.estatus_aprobacion || "pendiente",
      numero_expediente: item.numero_expediente || "",
      motivo_rechazo: item.motivo_rechazo || "",
      aprobado_por_nombre: ap,
      correo_electronico: item.correo_electronico || "",
      recursos_solicitados: item.recursos_solicitados || [],
    },
  };
};

export const auditorio = {
  getEventos: async (): Promise<EventoAuditorio[]> => {
    try {
      const res = await axiosInstance.get("/api/educacion/solicitudes-espacio", {
        params: { _t: Date.now() },
      });
      const data = extractList(res);
      return data.map(mapEvento);
    } catch (e: any) {
      throw new Error(`Error fetching eventos: ${e.message}`);
    }
  },

  getTiposEvento: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/tipos-evento", {
        params: { _t: Date.now() },
      });
      return extractList(res);
    } catch (e: any) {
      throw new Error(`Error fetching tipos de evento: ${e.message}`);
    }
  },

  crearTipoEvento: async (payload: { nombre: string; descripcion?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post("/api/tipos-evento", payload);
      return { success: true, message: "Tipo de evento creado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear tipo de evento");
    }
  },

  actualizarTipoEvento: async (id: string, payload: { nombre?: string; descripcion?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/tipos-evento/${id}`, payload);
      return { success: true, message: "Tipo de evento actualizado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar tipo de evento");
    }
  },

  eliminarTipoEvento: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/tipos-evento/${id}`);
      return { success: true, message: "Tipo de evento eliminado." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar tipo de evento");
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

  aprobarReservaAuditorio: async (id: string): Promise<void> => {
    try {
      await axiosInstance.put(`/api/educacion/solicitudes-espacio/${id}/aprobar`);
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al aprobar reserva");
    }
  },

  rechazarReservaAuditorio: async (id: string, motivo: string): Promise<void> => {
    try {
      await axiosInstance.put(`/api/educacion/solicitudes-espacio/${id}/rechazar`, { motivo_rechazo: motivo });
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al rechazar reserva");
    }
  },
};
