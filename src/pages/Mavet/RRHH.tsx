import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { exportarReporteAsistencia, exportarCartaAvalHoras } from "../../services/pdf.service";
import { RegistroAsistencia, Trabajador, Usuario } from "../../types";

interface Cargo { id_cargo: number; nombre_cargo: string; }

// ── Iconos ──────────────────────────────────────────────────────────────────
const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

// ── Estado inicial ───────────────────────────────────────────────────────────
const initialTrabajadorState = {
  cedula: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  correo_personal: "",
  id_cargo: 0,
  horas_semanales: 0,
  estado: "Activo" as "Activo" | "Inactivo",
};

const initialUsuarioState = {
  correo: "",
  password: "",
  id_rol: 0,
  id_trabajador: 0,
  estado: true,
};

// ── Componente principal ─────────────────────────────────────────────────────
export default function RRHH() {
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
  const [formData, setFormData] = useState(initialTrabajadorState);
  const [formUsuario, setFormUsuario] = useState(initialUsuarioState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  // Modo edición: almacena el ID del registro que se está editando
  const [editingTrabajadorId, setEditingTrabajadorId] = useState<number | null>(null);
  const [editingUsuarioId, setEditingUsuarioId] = useState<number | null>(null);
  const [selectedTrabajadorForDetail, setSelectedTrabajadorForDetail] = useState<Trabajador | null>(null);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  const refreshData = async () => {
    const [dataAsist, dataTrab, dataCargos, dataUsers, dataRoles] = await Promise.all([
      mavetApi.getAsistencia(),
      mavetApi.getTrabajadores(),
      mavetApi.getCargos(),
      mavetApi.getUsuarios(),
      mavetApi.getRoles()
    ]);
    setAsistencias(dataAsist);
    setTrabajadores(dataTrab);
    setCargos(dataCargos);
    setUsuarios(dataUsers);
    setRoles(dataRoles);
  };

  useEffect(() => {
    (async () => {
      try { await refreshData(); }
      catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4500);
  };

  // ── Abrir modal Trabajador ─────────────────────────────────────────────────
  const handleOpenCrearTrabajador = () => {
    setEditingTrabajadorId(null);
    setFormData({ ...initialTrabajadorState, id_cargo: cargos[0]?.id_cargo || 0 });
    openTrabajador();
  };

  const handleOpenEditarTrabajador = (t: Trabajador) => {
    setEditingTrabajadorId(t.id ?? null);
    // Buscar id_cargo por nombre
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
    });
    openTrabajador();
  };

  // ── Abrir modal Usuario ────────────────────────────────────────────────────
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
      password: "",           // Vacío: si no se cambia, el backend lo ignora
      id_rol: rolObj?.id_rol || 0,
      id_trabajador: trabObj?.id || u.trabajador?.id || 0,
      estado: u.estado === true || u.estado === "Activo" || u.estado as any === true,
    });
    openUsuario();
  };

  // ── Handlers de cambio ─────────────────────────────────────────────────────
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

  // ── Submit Trabajador (crear / editar) ─────────────────────────────────────
  const handleSubmitTrabajador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cedula || !formData.nombres || !formData.apellidos || formData.id_cargo === 0) {
      showAlert("Por favor complete todos los campos obligatorios.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingTrabajadorId !== null) {
        await mavetApi.actualizarTrabajador(editingTrabajadorId, formData);
        showAlert("Trabajador actualizado exitosamente.", "success");
      } else {
        await mavetApi.registrarTrabajador(formData);
        showAlert("Trabajador registrado exitosamente.", "success");
      }
      closeTrabajador();
      await refreshData();
      setActiveTab("trabajadores");
    } catch (err: any) {
      showAlert(err.message || "Error al guardar el trabajador.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submit Usuario (crear / editar) ────────────────────────────────────────
  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsuario.correo || formUsuario.id_rol === 0) {
      showAlert("Por favor complete todos los campos obligatorios.", "error");
      return;
    }
    if (editingUsuarioId === null && !formUsuario.password) {
      showAlert("La contraseña inicial es requerida.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingUsuarioId !== null) {
        await mavetApi.actualizarUsuario(editingUsuarioId, formUsuario);
        showAlert("Usuario actualizado exitosamente.", "success");
      } else {
        await mavetApi.registrarUsuario(formUsuario);
        showAlert("Usuario creado exitosamente.", "success");
      }
      closeUsuario();
      await refreshData();
      setActiveTab("usuarios");
    } catch (err: any) {
      showAlert(err.message || "Error al guardar el usuario.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── PDF ────────────────────────────────────────────────────────────────────
  const handleExportAsistencia = () => {
    if (asistencias.length === 0) { showAlert("No hay registros de asistencia para exportar.", "error"); return; }
    exportarReporteAsistencia(filteredAsistencias);
    showAlert("Reporte de asistencia generado.", "success");
  };

  const handleCartaAval = (trabajador: Trabajador) => {
    exportarCartaAvalHoras(trabajador, asistencias);
    showAlert(`Carta de aval de ${trabajador.nombre} ${trabajador.apellido} generada.`, "success");
  };

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filteredAsistencias = useMemo(() =>
    asistencias.filter((a) =>
      a.trabajadorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cedula.toLowerCase().includes(searchTerm.toLowerCase())
    ), [asistencias, searchTerm]);

  const filteredTrabajadores = useMemo(() =>
    trabajadores.filter((t) =>
      `${t.nombre} ${t.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cedula.toLowerCase().includes(searchTerm.toLowerCase())
    ), [trabajadores, searchTerm]);

  const filteredUsuarios = useMemo(() =>
    usuarios.filter((u) =>
      u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.trabajador?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
    ), [usuarios, searchTerm]);

  // ── Clases compartidas ─────────────────────────────────────────────────────
  const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none";
  const labelCls = "block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 relative">
      {/* Alerta flotante */}
      {alertInfo.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${alertInfo.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <span className="font-semibold text-sm">{alertInfo.type === "success" ? "✅" : "⚠️"} {alertInfo.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de RRHH y Usuarios</h1>
          <p className="text-sm text-gray-500">Personal activo, accesos al sistema y registros de asistencia.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportAsistencia}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar Asistencia PDF
          </button>
          {activeTab === "usuarios" ? (
            <button
              onClick={handleOpenCrearUsuario}
              className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Crear Usuario
            </button>
          ) : activeTab === "trabajadores" ? (
            <button
              onClick={handleOpenCrearTrabajador}
              className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Registrar Trabajador
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {/* Tabs + Búsqueda */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {(["trabajadores", "usuarios", "asistencias"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input type="text" placeholder="Buscar por cédula, nombre o correo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">Cargando datos...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">

              {/* ─── Tabla: Trabajadores ──────────────────────────────────────── */}
              {activeTab === "trabajadores" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                      <th className="px-5 py-4">Cédula</th>
                      <th className="px-5 py-4">Nombres</th>
                      <th className="px-5 py-4">Apellidos</th>
                      <th className="px-5 py-4">Cargo</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTrabajadores.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500"><p className="font-medium">No se encontraron trabajadores</p></td></tr>
                    ) : filteredTrabajadores.map((t) => (
                      <tr 
                        key={t.cedula} 
                        onClick={() => setSelectedTrabajadorForDetail(t)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4 font-mono text-xs font-semibold">{t.cedula}</td>
                        <td className="px-5 py-4 font-semibold">{t.nombre}</td>
                        <td className="px-5 py-4 font-semibold">{t.apellido}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{t.cargo}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            t.estado === "Activo" 
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400" 
                              : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {t.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleCartaAval(t)}
                              title="Generar Carta de Aval"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              PDF
                            </button>
                            <button
                              onClick={() => handleOpenEditarTrabajador(t)}
                              title="Editar trabajador"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-brand-300 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                            >
                              <IconEdit /> Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ─── Tabla: Usuarios ─────────────────────────────────────────── */}
              {activeTab === "usuarios" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                      <th className="px-5 py-4">Usuario (Correo)</th>
                      <th className="px-5 py-4">Trabajador Vinculado</th>
                      <th className="px-5 py-4">Cargo</th>
                      <th className="px-5 py-4 text-center">Contraseña</th>
                      <th className="px-5 py-4 text-center">Rol</th>
                      <th className="px-5 py-4 text-center">Estado</th>
                      <th className="px-5 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsuarios.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-500"><p className="font-medium">No se encontraron usuarios</p></td></tr>
                    ) : filteredUsuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-brand-700 dark:text-brand-400">{u.correo}</td>
                        <td className="px-5 py-4 font-medium">{u.trabajador ? `${u.trabajador.nombre}` : <span className="text-gray-400 italic">No vinculado</span>}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{u.trabajador ? u.trabajador.cargo : "—"}</td>
                        <td className="px-5 py-4 text-center text-gray-500 tracking-[0.2em]">••••••••</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">{u.rol}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${(u.estado === true || u.estado === "Activo") ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {(u.estado === true || u.estado === "Activo") ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleOpenEditarUsuario(u)}
                            title="Editar usuario"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-brand-300 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          >
                            <IconEdit /> Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ─── Tabla: Asistencias ──────────────────────────────────────── */}
              {activeTab === "asistencias" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                      <th className="px-5 py-4">Fecha</th>
                      <th className="px-5 py-4">Cédula</th>
                      <th className="px-5 py-4">Nombre y Apellido</th>
                      <th className="px-5 py-4">Cargo</th>
                      <th className="px-5 py-4 text-center border-l border-gray-200 dark:border-gray-700">Ent. Mañana</th>
                      <th className="px-5 py-4 text-center">Sal. Tarde</th>
                      <th className="px-5 py-4 text-center">Horas Cumplidas</th>
                      <th className="px-5 py-4">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAsistencias.length === 0 ? (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-500"><p className="font-medium">No hay registros de asistencia</p></td></tr>
                    ) : filteredAsistencias.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-gray-500">{a.fecha}</td>
                        <td className="px-5 py-4 font-mono text-xs font-semibold">{a.cedula}</td>
                        <td className="px-5 py-4 font-semibold">{a.trabajadorNombre}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{a.cargo}</td>
                        <td className="px-5 py-4 text-center font-mono text-xs text-brand-700 dark:text-brand-400 font-medium border-l border-gray-100 dark:border-gray-700">{a.entradaManana}</td>
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-600">{a.salidaTarde}</td>
                        <td className="px-5 py-4 text-center font-semibold text-sm">{a.horasCumplidas != null ? `${a.horasCumplidas}h` : "—"}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={a.observaciones}>{a.observaciones || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <span>Mostrando {activeTab === "trabajadores" ? filteredTrabajadores.length : activeTab === "usuarios" ? filteredUsuarios.length : filteredAsistencias.length} registros</span>
            </div>
          </>
        )}
      </div>

      {/* ─── Modal: Crear / Editar Trabajador ─────────────────────────────── */}
      <Modal isOpen={isOpenTrabajador} onClose={closeTrabajador} className="max-w-[550px] p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {editingTrabajadorId !== null ? "Editar Trabajador" : "Registrar Nuevo Trabajador"}
          </h3>
          <form onSubmit={handleSubmitTrabajador} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nombres</label>
                <input type="text" name="nombres" value={formData.nombres} onChange={handleChangeTrabajador} placeholder="Ej. Ricardo Andrés" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Apellidos</label>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChangeTrabajador} placeholder="Ej. López Martínez" className={inputCls} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Cédula</label>
                <input type="text" name="cedula" value={formData.cedula} onChange={handleChangeTrabajador} placeholder="V-12345678" className={inputCls} required
                  readOnly={editingTrabajadorId !== null} />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChangeTrabajador} placeholder="0414-1234567" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Correo Personal</label>
                <input type="email" name="correo_personal" value={formData.correo_personal} onChange={handleChangeTrabajador} placeholder="ejemplo@correo.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Horas Semanales Requeridas</label>
                <input type="number" name="horas_semanales" value={formData.horas_semanales} onChange={handleChangeTrabajador} placeholder="Ej. 40" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Cargo</label>
                <select name="id_cargo" value={formData.id_cargo} onChange={handleChangeTrabajador} className={inputCls} required>
                  <option value={0} disabled>Seleccione un cargo...</option>
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChangeTrabajador} className={inputCls}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
              <button type="button" onClick={closeTrabajador} disabled={isSubmitting} className="px-4 py-1.5 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting || formData.id_cargo === 0} className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  : editingTrabajadorId !== null ? "Guardar Cambios" : "Registrar Trabajador"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ─── Modal: Crear / Editar Usuario ────────────────────────────────── */}
      <Modal isOpen={isOpenUsuario} onClose={closeUsuario} className="max-w-[420px] p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {editingUsuarioId !== null ? "Editar Usuario" : "Registrar Nuevo Usuario"}
          </h3>
          <form onSubmit={handleSubmitUsuario} className="space-y-3">
            <div>
              <label className={labelCls}>Trabajador Vinculado</label>
              <select name="id_trabajador" value={formUsuario.id_trabajador} onChange={handleChangeUsuario} className={inputCls}>
                <option value={0}>Ninguno (Opcional)</option>
                {trabajadores.map((t) => (
                  <option key={t.id || t.cedula} value={t.id}>{t.nombre} {t.apellido}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Correo (Usuario de Acceso)</label>
              <input type="email" name="correo" value={formUsuario.correo} onChange={handleChangeUsuario} placeholder="usuario@mavet.org" className={inputCls} required />
            </div>

            <div>
              <label className={labelCls}>
                {editingUsuarioId !== null ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña Inicial"}
              </label>
              <input
                type="password"
                name="password"
                value={formUsuario.password}
                onChange={handleChangeUsuario}
                placeholder="••••••••"
                className={inputCls}
                required={editingUsuarioId === null}
                minLength={editingUsuarioId === null ? 6 : undefined}
              />
              <p className="text-[11px] text-gray-500 mt-0.5">
                {editingUsuarioId !== null ? "Si dejas este campo vacío, la contraseña no será modificada." : "Debe tener al menos 6 caracteres."}
              </p>
            </div>

            <div>
              <label className={labelCls}>Rol del Sistema</label>
              <select name="id_rol" value={formUsuario.id_rol} onChange={handleChangeUsuario} className={inputCls} required>
                <option value={0} disabled>Seleccione un rol...</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                ))}
              </select>
            </div>

            {editingUsuarioId !== null && (
              <div>
                <label className={labelCls}>Estado</label>
                <select name="estado" value={formUsuario.estado ? "true" : "false"} onChange={handleChangeUsuario} className={inputCls}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo (Borrado Lógico)</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
              <button type="button" onClick={closeUsuario} disabled={isSubmitting} className="px-4 py-1.5 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting || formUsuario.id_rol === 0} className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  : editingUsuarioId !== null ? "Guardar Cambios" : "Crear Usuario"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Detalle (Ficha de Personal) */}
      <Modal
        isOpen={selectedTrabajadorForDetail !== null}
        onClose={() => setSelectedTrabajadorForDetail(null)}
        showCloseButton={false}
        className="max-w-3xl p-0 overflow-hidden"
      >
        {selectedTrabajadorForDetail && (
          <div className="flex flex-col md:flex-row min-h-[420px]">
            {/* Columna Izquierda: Ficha Visual */}
            <div 
              className="md:w-[280px] w-full bg-brand-950 p-5 flex flex-col items-center justify-between relative text-white"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            >
              {/* Encabezado Ficha */}
              <div className="w-full flex justify-between text-[11px] font-semibold tracking-wider text-brand-300">
                <span>{selectedTrabajadorForDetail.cedula}</span>
                <span>REGISTRO RRHH</span>
              </div>

              {/* Contenedor Ficha de Personal */}
              <div className="w-44 h-56 my-6 border border-brand-800/60 bg-brand-950/40 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center relative p-4 group overflow-hidden">
                {/* Esquinas Reforzadas */}
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-brand-400"></div>
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-brand-400"></div>
                <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-brand-400"></div>
                <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-brand-400"></div>

                <div className="flex flex-col items-center justify-center">
                  <svg className="w-10 h-10 text-brand-400/80 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold text-[11px] tracking-wider text-brand-100 uppercase text-center">Ficha de Personal</span>
                  <span className="text-[9px] text-brand-300/60 tracking-widest uppercase mt-1 text-center font-serif">MAVET RRHH</span>
                </div>
              </div>

              {/* Pie Ficha */}
              <div className="text-center">
                <p className="text-xs font-semibold tracking-widest text-brand-300">MAVET</p>
                <p className="text-[9px] text-brand-400/60 mt-0.5">Museo de Artes Visuales y del Espacio</p>
              </div>
            </div>

            {/* Columna Derecha: Datos */}
            <div className="flex-1 p-6 bg-[#fcfafa] dark:bg-gray-900 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                      {selectedTrabajadorForDetail.nombre} {selectedTrabajadorForDetail.apellido}
                    </h2>
                    <p className="text-brand-500 dark:text-brand-400 font-semibold text-xs mt-1">
                      • {selectedTrabajadorForDetail.cargo}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedTrabajadorForDetail(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tarjeta Estado Laboral */}
                <div className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm my-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016a11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado Laboral</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Condición Actual</span>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                    selectedTrabajadorForDetail.estado === 'Activo' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' :
                    'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    {selectedTrabajadorForDetail.estado}
                  </span>
                </div>

                {/* Grilla de Parámetros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                  {/* Cédula */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.378 0 2.483.964 2.483 2.15H5C5 16.114 6.105 15.15 7.483 15.15z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cédula</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedTrabajadorForDetail.cedula}</span>
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cargo</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedTrabajadorForDetail.cargo}</span>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Teléfono de Contacto</span>
                      <span className="text-xs font-semibold text-gray-855 dark:text-gray-200">{selectedTrabajadorForDetail.telefono || '—'}</span>
                    </div>
                  </div>

                  {/* Correo */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Correo Electrónico</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedTrabajadorForDetail.correo || '—'}</span>
                    </div>
                  </div>

                  {/* Horas Semanales */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Horas Semanales Requeridas</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedTrabajadorForDetail.horas_semanales || '0'} horas</span>
                    </div>
                  </div>

                  {/* Estatus Laboral */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estatus Laboral</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedTrabajadorForDetail.estado}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones del pie */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setSelectedTrabajadorForDetail(null)}
                  className="px-5 py-2 text-xs font-semibold text-gray-655 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleOpenEditarTrabajador(selectedTrabajadorForDetail);
                    setSelectedTrabajadorForDetail(null);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Trabajador
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
