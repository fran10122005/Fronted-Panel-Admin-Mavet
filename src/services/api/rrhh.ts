import { axiosInstance, extractPagination, extractList } from "./client";
import type {
  Trabajador,
  TrabajadorPayload,
  AsistenciaPayload,
  RegistroAsistencia,
  PinVerificarPayload,
  PinConfirmarPayload,
  PinCambiarPayload,
  PinVerificarResponse,
  ConfirmarAsistenciaResponse,
  EstadoAsistencia,
} from "../../types";

export const rrhh = {
  getTrabajadores: async (page?: number, limit?: number): Promise<{ data: Trabajador[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      const res = await axiosInstance.get("/api/rrhh/trabajadores", { params });
      const list = extractList(res).map((item: any) => ({
        cedula: item.cedula,
        nombre: item.nombres,
        apellido: item.apellidos,
        telefono: item.telefono || "",
        correo: item.correo_personal || "",
        cargo: item.CargoTrabajador?.nombre_cargo || "Sin cargo",
        fecha_ingreso: item.fecha_ingreso || "",
        fecha_nacimiento: item.fecha_nacimiento || "",
        direccion: item.direccion || "",
        horas_semanales: item.horas_semanales || 0,
        estado: item.estado === true || item.estado === "Activo" ? "Activo" : "Inactivo",
        id: item.id_trabajador,
        qr_uuid: item.qr_uuid || undefined,
        foto_url: item.foto_url || undefined,
        pin_hash: item.pin_hash || undefined,
      }));
      return extractPagination(res, list);
    } catch (e) {
      console.error(e);
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  getAsistencia: async (page?: number, limit?: number, fecha?: string): Promise<{ data: RegistroAsistencia[]; totalItems: number; totalPages: number; currentPage: number }> => {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      if (fecha !== undefined) params.fecha = fecha;
      const res = await axiosInstance.get("/api/rrhh/asistencias", { params });
      const list = extractList(res).map((item: any) => {
        const t = item.Trabajador || {};
        const c = t.CargoTrabajador || {};
        return {
          id: item.id_asistencia.toString(),
          fecha: item.fecha,
          cedula: t.cedula || "",
          trabajadorNombre: `${t.nombres || ""} ${t.apellidos || ""}`.trim(),
          cargo: c.nombre_cargo || "Sin cargo",
          entrada: item.entrada_manana
            ? new Date(item.entrada_manana).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
            : "-",
          salida: item.salida_manana
            ? new Date(item.salida_manana).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
            : "-",
          horasCumplidas: item.horas_cumplidas_dia ?? null,
          observaciones: item.observaciones || "",
          horas_justificadas: item.horas_justificadas ?? null,
          tipo_justificacion: item.tipo_justificacion || null,
        };
      });
      return extractPagination(res, list);
    } catch (e) {
      console.error(e);
      return { data: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    }
  },

  registrarTrabajador: async (payload: TrabajadorPayload): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const body: any = {
        cedula: payload.cedula,
        nombres: payload.nombres || (payload as any).nombre,
        apellidos: payload.apellidos || (payload as any).apellido,
        telefono: payload.telefono,
        correo_personal: payload.correo_personal || (payload as any).correo,
        id_cargo: payload.id_cargo,
        horas_semanales: payload.horas_semanales,
        estado: payload.estado === "Activo",
      };
      if (payload.direccion !== undefined) body.direccion = payload.direccion;
      if (payload.fecha_nacimiento !== undefined) body.fecha_nacimiento = payload.fecha_nacimiento;
      if (payload.fecha_ingreso !== undefined) body.fecha_ingreso = payload.fecha_ingreso;
      const res = await axiosInstance.post("/api/rrhh/trabajadores", body);
      return { success: true, message: "Trabajador registrado exitosamente.", data: res.data?.data };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al registrar trabajador");
    }
  },

  subirFotoTrabajador: async (id: number | string, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("foto", file);
      const res = await axiosInstance.post(`/api/rrhh/trabajadores/${id}/foto`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.url || res.data?.data?.url || "";
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al subir la foto");
    }
  },

  actualizarTrabajador: async (id: string, payload: TrabajadorPayload): Promise<{ success: boolean; message: string }> => {
    try {
      const body: any = {
        nombres: payload.nombres || (payload as any).nombre,
        apellidos: payload.apellidos || (payload as any).apellido,
        telefono: payload.telefono,
        correo_personal: payload.correo_personal || (payload as any).correo,
        id_cargo: payload.id_cargo,
        horas_semanales: payload.horas_semanales,
        estado: payload.estado === "Activo",
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

  eliminarTrabajador: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.delete(`/api/rrhh/trabajadores/${id}`);
      return { success: true, message: res.data?.message || "Trabajador eliminado" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar trabajador");
    }
  },

  getEstadoAsistencia: async (params: { qr_uuid?: string; cedulaTrabajador?: string }): Promise<EstadoAsistencia> => {
    const query = new URLSearchParams();
    if (params.qr_uuid) query.set("qr_uuid", params.qr_uuid);
    if (params.cedulaTrabajador) query.set("cedulaTrabajador", params.cedulaTrabajador);
    try {
      const res = await axiosInstance.get(`/api/rrhh/asistencias/estado?${query.toString()}`);
      return res.data.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error consultando estado de asistencia");
    }
  },

  registrarAsistencia: async (payload: AsistenciaPayload): Promise<{ success: boolean; message: string }> => {
    if (!payload.cedulaTrabajador && !payload.qr_uuid) throw new Error("Debe proveer cédula o QR UUID");
    try {
      await axiosInstance.post("/api/rrhh/asistencias", payload);
      return { success: true, message: `Asistencia de ${payload.tipoMovimiento} registrada con éxito.` };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al registrar asistencia");
    }
  },

  getSemanaAsistencia: async (cedulaTrabajador: string): Promise<any> => {
    try {
      const res = await axiosInstance.get("/api/rrhh/asistencias/semana", { params: { cedulaTrabajador } });
      return res.data?.data || { horasSemanales: 0, horasAcumuladas: 0, horasRestantes: 0, diasRegistrados: 0 };
    } catch {
      return { horasSemanales: 0, horasAcumuladas: 0, horasRestantes: 0, diasRegistrados: 0 };
    }
  },

  getResumenSemanalTodos: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get("/api/rrhh/asistencias/semana/resumen");
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  updateAsistenciaObservaciones: async (id: string, observaciones: string, horas_justificadas?: number, tipo_justificacion?: string): Promise<void> => {
    const body: any = { observaciones };
    if (horas_justificadas !== undefined) body.horas_justificadas = horas_justificadas;
    if (tipo_justificacion !== undefined) body.tipo_justificacion = tipo_justificacion;
    await axiosInstance.patch(`/api/rrhh/asistencias/${id}`, body);
  },



  verificarPin: async (payload: PinVerificarPayload): Promise<PinVerificarResponse> => {
    try {
      const res = await axiosInstance.post('/api/rrhh/asistencias/verificar-pin', payload);
      return res.data.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Error al verificar PIN');
    }
  },

  confirmarAsistenciaConPin: async (payload: PinConfirmarPayload): Promise<ConfirmarAsistenciaResponse> => {
    try {
      const res = await axiosInstance.post('/api/rrhh/asistencias/confirmar', payload);
      return res.data.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Error al confirmar asistencia');
    }
  },

  cambiarPinPropio: async (payload: PinCambiarPayload): Promise<{ message: string }> => {
    try {
      const res = await axiosInstance.post('/api/rrhh/asistencias/cambiar-pin', payload);
      return res.data.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Error al cambiar PIN');
    }
  },

  resetPinTrabajador: async (id: string): Promise<{ pinTemporal: string; message: string }> => {
    try {
      const res = await axiosInstance.post(`/api/rrhh/asistencias/${id}/reset-pin`);
      return res.data.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Error al restablecer PIN');
    }
  },

  verificarFacial: async (payload: { cedulaTrabajador?: string; qr_uuid?: string; intento?: number; total_intentos?: number }): Promise<PinVerificarResponse> => {
    try {
      const res = await axiosInstance.post('/api/rrhh/asistencias/verificar-facial', payload);
      return res.data.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Error en verificación facial');
    }
  },

  registrarFacialFallido: async (payload: { cedulaTrabajador?: string; qr_uuid?: string; motivo?: string }): Promise<void> => {
    try {
      await axiosInstance.post('/api/rrhh/asistencias/facial-fallido', payload);
    } catch {}
  },

  actualizarTrabajadorFacial: async (id: string, data: { descriptor_facial?: string; descriptores_faciales?: string[]; usarFacial?: boolean; consentimientoFacial?: boolean; fechaConsentimiento?: string }): Promise<void> => {
    await axiosInstance.put(`/api/rrhh/trabajadores/${id}`, data);
  },
};
