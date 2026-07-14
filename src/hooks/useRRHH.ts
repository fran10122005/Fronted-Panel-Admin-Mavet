import { useState, useEffect, useMemo } from "react";
import { useModal } from "./useModal";
import { useConfirm } from "./useConfirm";
import { useDebounce } from "./useDebounce";
import { mavetApi } from "../services/api";
import { exportarReporteAsistencia, exportarCartaAvalHoras } from "../services/pdf.service";
import toast from "react-hot-toast";
import { RegistroAsistencia, Trabajador, Usuario, Cargo, ResumenSemanalTrabajador } from "../types";

export const ITEMS_PER_PAGE = 20;

const initialTrabajadorState = {
  cedula: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  correo_personal: "",
  id_cargo: "",
  horas_semanales: 0,
  estado: "Activo" as "Activo" | "Inactivo",
  fecha_nacimiento: "",
  direccion: "",
  fecha_ingreso: "",
  foto_url: "",
};

const initialUsuarioState = {
  correo: "",
  password: "",
  id_rol: "",
  id_trabajador: "",
  estado: true,
};

export function useRRHH() {
  const { isOpen: isOpenTrabajador, openModal: openTrabajador, closeModal: closeTrabajador } = useModal();
  const { isOpen: isOpenUsuario, openModal: openUsuario, closeModal: closeUsuario } = useModal();

  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>([]);
  const [resumenSemanal, setResumenSemanal] = useState<ResumenSemanalTrabajador[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"asistencias" | "trabajadores" | "usuarios">("trabajadores");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [formData, setFormData] = useState(initialTrabajadorState);
  const [formUsuario, setFormUsuario] = useState(initialUsuarioState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { confirm, requestConfirm } = useConfirm();

  const [trabajPage, setTrabajPage] = useState(1);
  const [trabajTotalPages, setTrabajTotalPages] = useState(1);
  const [trabajTotalItems, setTrabajTotalItems] = useState(0);
  const [asistPage, setAsistPage] = useState(1);
  const [asistTotalPages, setAsistTotalPages] = useState(1);
  const [asistTotalItems, setAsistTotalItems] = useState(0);
  
  const [asistFecha, setAsistFecha] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const [editingTrabajadorId, setEditingTrabajadorId] = useState<string | null>(null);
  const [editingUsuarioId, setEditingUsuarioId] = useState<string | null>(null);
  const [selectedTrabajadorForDetail, setSelectedTrabajadorForDetail] = useState<Trabajador | null>(null);
  const [selectedForJustificacion, setSelectedForJustificacion] = useState<ResumenSemanalTrabajador | null>(null);

  const refreshData = async () => {
    const [dataCargos, dataUsers, dataRoles] = await Promise.all([
      mavetApi.getCargos(),
      mavetApi.getUsuarios(),
      mavetApi.getRoles()
    ]);
    setCargos(dataCargos);
    setUsuarios(dataUsers);
    setRoles(dataRoles);
    await Promise.all([refreshTrabajadores(1), refreshAsistencias(1)]);
  };

  const refreshTrabajadores = async (page: number) => {
    const res = await mavetApi.getTrabajadores(page, ITEMS_PER_PAGE);
    setTrabajadores(res.data);
    setTrabajPage(res.currentPage);
    setTrabajTotalPages(res.totalPages);
    setTrabajTotalItems(res.totalItems);
  };

  const refreshAsistencias = async (page: number, date?: string) => {
    const targetDate = date ?? asistFecha;
    const res = await mavetApi.getAsistencia(page, ITEMS_PER_PAGE, targetDate);
    setAsistencias(res.data);
    setAsistPage(res.currentPage);
    setAsistTotalPages(res.totalPages);
    setAsistTotalItems(res.totalItems);
  };

  const refreshResumenSemanal = async () => {
    const data = await mavetApi.getResumenSemanalTodos();
    setResumenSemanal(data);
  };

  const handleUpdateObservaciones = async (id: string, observaciones: string, horas_justificadas?: number) => {
    try {
      await mavetApi.updateAsistenciaObservaciones(id, observaciones, horas_justificadas);
      setAsistencias((prev) =>
        prev.map((a) => (a.id === id ? { ...a, observaciones, ...(horas_justificadas !== undefined && { horas_justificadas }) } : a))
      );
      setResumenSemanal((prev) =>
        prev.map((r) => {
          if (!r.dias.some((d) => d.id === id)) return r;
          
          const newDias = r.dias.map((d) =>
            d.id === id ? { ...d, observaciones, ...(horas_justificadas !== undefined && { horas_justificadas }) } : d
          );
          
          const newHorasAcumuladas = newDias.reduce((sum, d) => sum + (d.horas || 0) + (d.horas_justificadas || 0), 0);
          const newHorasRestantes = Math.max(0, r.horas_semanales - newHorasAcumuladas);

          return {
            ...r,
            observaciones,
            dias: newDias,
            horas_acumuladas: Math.round(newHorasAcumuladas * 100) / 100,
            horas_restantes: Math.round(newHorasRestantes * 100) / 100,
            cumplio: newHorasRestantes <= 0,
          };
        })
      );
    } catch (error) {
      toast.error("Error al actualizar observaciones");
      throw error; // Rethrow so the caller knows it failed
    }
  };

  const handleJustificarSemana = async (cedula: string, observaciones: string, horas_justificadas: number) => {
    try {
      await mavetApi.justificarHoras(cedula, observaciones, horas_justificadas);
      await refreshResumenSemanal();
    } catch (error) {
      toast.error("Error al guardar justificación");
      throw error;
    }
  };

  useEffect(() => {
    (async () => {
      try { await refreshData(); }
      catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (activeTab === "asistencias") refreshResumenSemanal();
  }, [activeTab]);

  const handleOpenCrearTrabajador = () => {
    setEditingTrabajadorId(null);
    setFormData({ ...initialTrabajadorState, id_cargo: cargos[0]?.id_cargo || "" });
    openTrabajador();
  };

  const handleOpenEditarTrabajador = (t: Trabajador) => {
    setEditingTrabajadorId(t.id?.toString() ?? null);
    const cargoObj = cargos.find(c => c.nombre_cargo === t.cargo);
    setFormData({
      cedula: t.cedula,
      nombres: t.nombre,
      apellidos: t.apellido,
      telefono: t.telefono || "",
      correo_personal: t.correo || "",
      id_cargo: cargoObj?.id_cargo || "",
      horas_semanales: t.horas_semanales || 0,
      estado: (t.estado === "Activo" ? "Activo" : "Inactivo"),
      fecha_nacimiento: (t as any).fecha_nacimiento || "",
      direccion: (t as any).direccion || "",
      fecha_ingreso: (t as any).fecha_ingreso || "",
      foto_url: (t as any).foto_url || "",
    });
    openTrabajador();
  };

  const handleOpenCrearUsuario = () => {
    setEditingUsuarioId(null);
    setFormUsuario({ ...initialUsuarioState, id_rol: roles[0]?.id_rol || "" });
    openUsuario();
  };

  const handleOpenEditarUsuario = (u: Usuario) => {
    setEditingUsuarioId(u.id ?? null);
    const rolObj = roles.find(r => r.nombre_rol === u.rol);
    const trabObj = trabajadores.find(t => `${t.nombre} ${t.apellido}` === u.trabajador?.nombre);
    setFormUsuario({
      correo: u.correo,
      password: "",
      id_rol: rolObj?.id_rol || "",
      id_trabajador: String(trabObj?.id ?? u.id_trabajador ?? ""),
      estado: u.estado === true,
    });
    openUsuario();
  };

  const handleResetPassword = (_userId: string, correo: string) => {
    requestConfirm({
      title: "Restablecer contraseña",
      message: `¿Enviar correo de restablecimiento de contraseña a "${correo}"?`,
      variant: "info",
      confirmLabel: "Enviar",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          await mavetApi.resetPasswordUsuario(correo);
          toast.success("Correo de restablecimiento enviado exitosamente.");
        } catch (err: any) {
          toast.error(err.message || "Error al enviar correo de restablecimiento.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleDeleteTrabajador = (t: Trabajador) => {
    requestConfirm({
      title: "Eliminar trabajador",
      message: `¿Está seguro de que desea eliminar a "${t.nombre} ${t.apellido}"? Se moverá a la papelera.`,
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        try {
          await mavetApi.eliminarTrabajador(t.id?.toString() ?? "");
          toast.success("Trabajador eliminado. Se movió a la papelera.");
          await refreshData();
        } catch (err: any) {
          toast.error(err.message || "Error al eliminar trabajador.");
        }
      },
    });
  };

  const handleDeleteUsuario = (u: Usuario) => {
    requestConfirm({
      title: "Eliminar usuario",
      message: `¿Está seguro de que desea eliminar al usuario "${u.correo}"? Esta acción no se puede deshacer.`,
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        try {
          await mavetApi.eliminarUsuario(u.id);
          toast.success("Usuario eliminado exitosamente.");
          await refreshData();
        } catch (err: any) {
          toast.error(err.message || "Error al eliminar usuario.");
        }
      },
    });
  };



  const handleSubmitTrabajador = async (data: any, photoFile?: File | null) => {
    setIsSubmitting(true);
    try {
      let trabajadorId = editingTrabajadorId;
      
      if (editingTrabajadorId !== null) {
        await mavetApi.actualizarTrabajador(editingTrabajadorId, data);
        toast.success("Trabajador actualizado exitosamente.");
      } else {
        const res = await mavetApi.registrarTrabajador(data);
        trabajadorId = res.data?.id_trabajador || res.data?.id;
        toast.success("Trabajador registrado exitosamente.");
      }
      
      if (photoFile && trabajadorId) {
        toast.loading("Subiendo foto...", { id: "upload-photo" });
        await mavetApi.subirFotoTrabajador(trabajadorId, photoFile);
        toast.success("Foto subida correctamente.", { id: "upload-photo" });
      }

      closeTrabajador();
      await refreshData();
      setActiveTab("trabajadores");

      if (editingTrabajadorId === null && trabajadorId) {
        requestConfirm({
          title: "Imprimir Carnet",
          message: "El trabajador ha sido registrado exitosamente. ¿Deseas imprimir su carnet ahora?",
          confirmLabel: "Imprimir",
          variant: "info",
          onConfirm: async () => {
            try {
              const res = await mavetApi.getTrabajadores(1, 100);
              const t = res.data.find(x => x.id === trabajadorId);
              if (t) {
                const { exportarCarnetTrabajador } = await import('../services/pdf.service');
                await exportarCarnetTrabajador(t);
              }
            } catch (err) {
              console.error(err);
              toast.error("Error al generar carnet");
            }
          }
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el trabajador.");
      toast.dismiss("upload-photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUsuario = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingUsuarioId !== null) {
        await mavetApi.actualizarUsuario(editingUsuarioId, data);
        toast.success("Usuario actualizado exitosamente.");
      } else {
        await mavetApi.registrarUsuario(data);
        toast.success("Usuario creado exitosamente.");
      }
      closeUsuario();
      await refreshData();
      setActiveTab("usuarios");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportAsistencia = () => {
    if (asistencias.length === 0) { toast.error("No hay registros de asistencia para exportar."); return; }
    exportarReporteAsistencia(asistencias, asistFecha);
    toast.success("Reporte de asistencia generado.");
  };

  const handleExportTrabajadores = async () => {
    try {
      const { exportarReporteTrabajadores } = await import('../services/pdf.service');
      await exportarReporteTrabajadores();
      toast.success("Reporte de trabajadores generado.");
    } catch {
      toast.error("Error al generar el reporte de trabajadores.");
    }
  };

  const handleExportUsuarios = async () => {
    try {
      const { exportarReporteUsuarios } = await import('../services/pdf.service');
      await exportarReporteUsuarios();
      toast.success("Reporte de usuarios generado.");
    } catch {
      toast.error("Error al generar el reporte de usuarios.");
    }
  };

  const handleCartaAval = (trabajador: Trabajador) => {
    exportarCartaAvalHoras(trabajador, asistencias);
    toast.success(`Carta de aval de ${trabajador.nombre} ${trabajador.apellido} generada.`);
  };

  const filteredAsistencias = useMemo(() =>
    asistencias.filter((a) =>
      a.trabajadorNombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.cedula.toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [asistencias, debouncedSearch]);

  const filteredTrabajadores = useMemo(() =>
    trabajadores.filter((t) =>
      `${t.nombre} ${t.apellido}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.cedula.toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [trabajadores, debouncedSearch]);

  const filteredUsuarios = useMemo(() =>
    usuarios.filter((u) =>
      u.correo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (u.trabajador?.nombre || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (u.trabajador?.cedula || "").toLowerCase().includes(debouncedSearch.toLowerCase().replace(/^[VEve]-/, ''))
    ), [usuarios, debouncedSearch]);

  return {
    asistencias, trabajadores, usuarios, cargos, roles,
    isLoading, activeTab, setActiveTab,
    searchTerm, setSearchTerm, debouncedSearch,
    formData, formUsuario, isSubmitting,
    confirm, requestConfirm,
    editingTrabajadorId, editingUsuarioId,
    selectedTrabajadorForDetail, setSelectedTrabajadorForDetail,
    selectedForJustificacion, setSelectedForJustificacion,
    trabajPage, trabajTotalPages, trabajTotalItems,
    asistPage, asistTotalPages, asistTotalItems, asistFecha, setAsistFecha,
    refreshTrabajadores, refreshAsistencias, refreshData,
    refreshResumenSemanal,
    resumenSemanal, handleUpdateObservaciones, handleJustificarSemana,
    filteredAsistencias, filteredTrabajadores, filteredUsuarios, usuarios,
    isOpenTrabajador, closeTrabajador,
    isOpenUsuario, closeUsuario,
    handleOpenCrearTrabajador, handleOpenEditarTrabajador,
    handleOpenCrearUsuario, handleOpenEditarUsuario,
    handleResetPassword,
    handleSubmitTrabajador, handleSubmitUsuario,
    handleExportAsistencia, handleExportTrabajadores, handleExportUsuarios,
    handleCartaAval, handleDeleteTrabajador, handleDeleteUsuario,

  };
}
