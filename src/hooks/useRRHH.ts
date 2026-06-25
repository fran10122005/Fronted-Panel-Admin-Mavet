import { useState, useEffect, useMemo } from "react";
import { useModal } from "./useModal";
import { useDebounce } from "./useDebounce";
import { mavetApi } from "../services/api";
import { exportarReporteAsistencia, exportarCartaAvalHoras } from "../services/pdf.service";
import toast from "react-hot-toast";
import { RegistroAsistencia, Trabajador, Usuario, Cargo } from "../types";

export const ITEMS_PER_PAGE = 20;

export const initialTrabajadorState = {
  cedula: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  correo_personal: "",
  id_cargo: 0,
  horas_semanales: 0,
  estado: "Activo" as "Activo" | "Inactivo",
  fecha_nacimiento: "",
  direccion: "",
  fecha_ingreso: "",
};

export const initialUsuarioState = {
  correo: "",
  password: "",
  id_rol: 0,
  id_trabajador: 0,
  estado: true,
};

export function useRRHH() {
  const { isOpen: isOpenTrabajador, openModal: openTrabajador, closeModal: closeTrabajador } = useModal();
  const { isOpen: isOpenUsuario, openModal: openUsuario, closeModal: closeUsuario } = useModal();

  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>([]);
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

  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; variant?: "danger" | "warning" | "info" }>({
    open: false, title: "", message: "", onConfirm: () => {}, variant: "danger",
  });

  const [trabajPage, setTrabajPage] = useState(1);
  const [trabajTotalPages, setTrabajTotalPages] = useState(1);
  const [trabajTotalItems, setTrabajTotalItems] = useState(0);
  const [asistPage, setAsistPage] = useState(1);
  const [asistTotalPages, setAsistTotalPages] = useState(1);
  const [asistTotalItems, setAsistTotalItems] = useState(0);

  const [editingTrabajadorId, setEditingTrabajadorId] = useState<number | null>(null);
  const [editingUsuarioId, setEditingUsuarioId] = useState<number | null>(null);
  const [selectedTrabajadorForDetail, setSelectedTrabajadorForDetail] = useState<Trabajador | null>(null);

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

  const refreshAsistencias = async (page: number) => {
    const res = await mavetApi.getAsistencia(page, ITEMS_PER_PAGE);
    setAsistencias(res.data);
    setAsistPage(res.currentPage);
    setAsistTotalPages(res.totalPages);
    setAsistTotalItems(res.totalItems);
  };

  useEffect(() => {
    (async () => {
      try { await refreshData(); }
      catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const handleOpenCrearTrabajador = () => {
    setEditingTrabajadorId(null);
    setFormData({ ...initialTrabajadorState, id_cargo: cargos[0]?.id_cargo || 0 });
    openTrabajador();
  };

  const handleOpenEditarTrabajador = (t: Trabajador) => {
    setEditingTrabajadorId(t.id ?? null);
    const cargoObj = cargos.find(c => c.nombre_cargo === t.cargo);
    setFormData({
      cedula: t.cedula,
      nombres: t.nombre,
      apellidos: t.apellido,
      telefono: t.telefono || "",
      correo_personal: t.correo || "",
      id_cargo: cargoObj?.id_cargo || 0,
      horas_semanales: t.horas_semanales || 0,
      estado: (t.estado === "Activo" ? "Activo" : "Inactivo"),
      fecha_nacimiento: (t as any).fecha_nacimiento || "",
      direccion: (t as any).direccion || "",
      fecha_ingreso: (t as any).fecha_ingreso || "",
    });
    openTrabajador();
  };

  const handleOpenCrearUsuario = () => {
    setEditingUsuarioId(null);
    setFormUsuario({ ...initialUsuarioState, id_rol: roles[0]?.id_rol || 0 });
    openUsuario();
  };

  const handleOpenEditarUsuario = (u: Usuario) => {
    setEditingUsuarioId(u.id ?? null);
    const rolObj = roles.find(r => r.nombre_rol === u.rol);
    const trabObj = trabajadores.find(t => `${t.nombre} ${t.apellido}` === u.trabajador?.nombre);
    setFormUsuario({
      correo: u.correo,
      password: "",
      id_rol: rolObj?.id_rol || 0,
      id_trabajador: trabObj?.id || u.id_trabajador || 0,
      estado: u.estado === true,
    });
    openUsuario();
  };

  const handleResetPassword = (userId: number, correo: string) => {
    setConfirm({
      open: true,
      title: "Restablecer contraseña",
      message: `¿Enviar correo de restablecimiento de contraseña a "${correo}"?`,
      variant: "info",
      confirmLabel: "Enviar",
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, open: false }));
        setIsSubmitting(true);
        try {
          await mavetApi.resetPasswordUsuario(userId);
          toast.success("Correo de restablecimiento enviado exitosamente.");
        } catch (err: any) {
          toast.error(err.message || "Error al enviar correo de restablecimiento.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleChangeTrabajador = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = (e.target.name === "id_cargo" || e.target.name === "horas_semanales")
      ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleChangeUsuario = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "id_rol" || name === "id_trabajador") {
      setFormUsuario({ ...formUsuario, [name]: Number(value) });
    } else if (name === "estado") {
      setFormUsuario({ ...formUsuario, estado: value === "true" });
    } else {
      setFormUsuario({ ...formUsuario, [name]: value });
    }
  };

  const handleSubmitTrabajador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cedula || !formData.nombres || !formData.apellidos || formData.id_cargo === 0) {
      toast.error("Por favor complete todos los campos obligatorios.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingTrabajadorId !== null) {
        await mavetApi.actualizarTrabajador(editingTrabajadorId, formData);
        toast.success("Trabajador actualizado exitosamente.");
      } else {
        await mavetApi.registrarTrabajador(formData);
        toast.success("Trabajador registrado exitosamente.");
      }
      closeTrabajador();
      await refreshData();
      setActiveTab("trabajadores");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el trabajador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsuario.correo || formUsuario.id_rol === 0) {
      toast.error("Por favor complete todos los campos obligatorios.");
      return;
    }
    if (editingUsuarioId === null && !formUsuario.password) {
      toast.error("La contraseña inicial es requerida.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingUsuarioId !== null) {
        await mavetApi.actualizarUsuario(editingUsuarioId, formUsuario);
        toast.success("Usuario actualizado exitosamente.");
      } else {
        await mavetApi.registrarUsuario(formUsuario);
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
    exportarReporteAsistencia(filteredAsistencias);
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
      (u.trabajador?.nombre || "").toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [usuarios, debouncedSearch]);

  return {
    asistencias, trabajadores, usuarios, cargos, roles,
    isLoading, activeTab, setActiveTab,
    searchTerm, setSearchTerm, debouncedSearch,
    formData, formUsuario, isSubmitting,
    confirm, setConfirm,
    editingTrabajadorId, editingUsuarioId,
    selectedTrabajadorForDetail, setSelectedTrabajadorForDetail,
    trabajPage, trabajTotalPages, trabajTotalItems,
    asistPage, asistTotalPages, asistTotalItems,
    refreshTrabajadores, refreshAsistencias,
    filteredAsistencias, filteredTrabajadores, filteredUsuarios,
    isOpenTrabajador, closeTrabajador,
    isOpenUsuario, closeUsuario,
    handleOpenCrearTrabajador, handleOpenEditarTrabajador,
    handleOpenCrearUsuario, handleOpenEditarUsuario,
    handleResetPassword,
    handleChangeTrabajador, handleChangeUsuario,
    handleSubmitTrabajador, handleSubmitUsuario,
    handleExportAsistencia, handleExportTrabajadores, handleExportUsuarios,
    handleCartaAval,
    initialTrabajadorState, initialUsuarioState,
  };
}
