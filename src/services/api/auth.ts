import { axiosInstance } from "./client";
import type { Rol, Usuario, UsuarioPayload } from "../../types";

export const auth = {
  login: async (correo: string, password: string): Promise<{ token: string; usuario: any }> => {
    try {
      const res = await axiosInstance.post("/api/auth/login", { correo, password });
      return res.data.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Credenciales incorrectas");
    }
  },

  getRoles: async (): Promise<Rol[]> => {
    try {
      const res = await axiosInstance.get("/api/auth/roles");
      return Array.isArray(res.data) ? res.data : res.data.data || [];
    } catch {
      return [];
    }
  },

  crearRol: async (payload: { nombre_rol: string; permisos?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.post("/api/auth/roles", payload);
      return { success: true, message: "Rol creado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al crear rol");
    }
  },

  actualizarRol: async (id: string, payload: { nombre_rol?: string; permisos?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.put(`/api/auth/roles/${id}`, payload);
      return { success: true, message: "Rol actualizado exitosamente." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar rol");
    }
  },

  eliminarRol: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.delete(`/api/auth/roles/${id}`);
      return { success: true, message: "Rol eliminado." };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar rol");
    }
  },

  getUsuarios: async (): Promise<Usuario[]> => {
    try {
      const res = await axiosInstance.get("/api/auth");
      const json = res.data;
      const list: any[] = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      return list.map((u: any) => ({
        id: u.id_usuario ?? u.id,
        correo: u.correo,
        rol: u.Role?.nombre_rol || "Sin Rol",
        estado: u.estado,
        id_trabajador: u.id_trabajador ?? u.Trabajador?.id_trabajador,
        trabajador: u.Trabajador
          ? {
              nombre: `${u.Trabajador.nombres || ""} ${u.Trabajador.apellidos || ""}`.trim(),
              cargo: u.Trabajador.CargoTrabajador?.nombre_cargo || "Sin Cargo",
            }
          : undefined,
      }));
    } catch (e) {
      console.error("[getUsuarios]", e);
      return [];
    }
  },

  registrarUsuario: async (payload: UsuarioPayload): Promise<{ success: boolean; message: string }> => {
    try {
      const body: any = { correo: payload.correo, password: payload.password, id_rol: payload.id_rol };
      if (payload.id_trabajador && payload.id_trabajador !== "") {
        body.id_trabajador = payload.id_trabajador;
      }
      await axiosInstance.post("/api/auth/register", body);
      return { success: true, message: "Usuario creado exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al registrar usuario");
    }
  },

  actualizarUsuario: async (id: string, payload: UsuarioPayload): Promise<{ success: boolean; message: string }> => {
    try {
      const body: any = { correo: payload.correo, id_rol: payload.id_rol, estado: payload.estado };
      if (payload.id_trabajador && payload.id_trabajador !== "") {
        body.id_trabajador = payload.id_trabajador;
      }
      await axiosInstance.put(`/api/auth/${id}`, body);
      return { success: true, message: "Usuario actualizado exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar usuario");
    }
  },

  resetPasswordUsuario: async (correo: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.post("/api/auth/forgot-password", { correo });
      return { success: true, message: res.data?.message || "Correo de restablecimiento enviado" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al restablecer contraseña");
    }
  },

  eliminarUsuario: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.delete(`/api/auth/${id}`);
      return { success: true, message: res.data?.message || "Usuario eliminado" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar usuario");
    }
  },

  getMe: async (): Promise<any> => {
    try {
      const res = await axiosInstance.get("/api/auth/me");
      return res.data.data;
    } catch {
      throw new Error("Error obteniendo perfil");
    }
  },

  updateMe: async (payload: any): Promise<{ success: boolean; message: string }> => {
    try {
      const body: any = {};
      if (payload.nombres !== undefined) body.nombres = payload.nombres;
      if (payload.apellidos !== undefined) body.apellidos = payload.apellidos;
      if (payload.telefono !== undefined) body.telefono = payload.telefono;
      if (payload.correo_personal !== undefined) body.correo_personal = payload.correo_personal;
      await axiosInstance.put("/api/auth/me", body);
      return { success: true, message: "Perfil actualizado exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al actualizar perfil");
    }
  },

  cambiarPassword: async (payload: { password_actual: string; password_nuevo: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosInstance.put("/api/auth/me/password", payload);
      return { success: true, message: res.data?.message || "Contraseña actualizada exitosamente" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al cambiar la contraseña");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } catch {
      // Silently fail, cookie will be cleared on frontend
    }
  },

  subirFotoPerfil: async (file: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append("foto", file);
      const res = await axiosInstance.post("/api/auth/me/foto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { url: res.data?.url || res.data?.data?.url || "" };
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al subir la foto");
    }
  },

  eliminarFotoPerfil: async (): Promise<void> => {
    try {
      await axiosInstance.delete("/api/auth/me/foto");
    } catch (e: any) {
      throw new Error(e.response?.data?.message || "Error al eliminar la foto");
    }
  },

  getAuditLogs: async (params?: { page?: number; limit?: number; desde?: string; hasta?: string; tipo?: string }): Promise<{ data: any[]; meta: { totalItems: number; totalPages: number; currentPage: number } }> => {
    try {
      const res = await axiosInstance.get("/api/auth/logs", { params });
      const body = res.data;
      const list = Array.isArray(body) ? body : Array.isArray(body.data) ? body.data : [];
      const meta = body?.meta || { totalItems: list.length, totalPages: 1, currentPage: 1 };
      return { data: list, meta };
    } catch {
      return { data: [], meta: { totalItems: 0, totalPages: 1, currentPage: 1 } };
    }
  },
};
