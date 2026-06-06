import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { exportarReporteAsistencia, exportarCartaAvalHoras } from "../../services/pdf.service";
import { RegistroAsistencia, Trabajador } from "../../types";

interface Cargo { id_cargo: number; nombre_cargo: string; }

const initialTrabajadorState = {
  cedula: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  correo_personal: "",
  id_cargo: 0,
  estado: "Activo" as "Activo" | "Inactivo",
};

export default function RRHH() {
  const { isOpen, openModal, closeModal } = useModal();

  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"asistencias" | "trabajadores">("trabajadores");

  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(initialTrabajadorState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  // Cargar datos iniciales
  useEffect(() => {
    const load = async () => {
      try {
        const [dataAsist, dataTrab, dataCargos] = await Promise.all([
          mavetApi.getAsistencia(),
          mavetApi.getTrabajadores(),
          fetch("http://localhost:3000/api/rrhh/cargos")
            .then((r) => r.json())
            .then((d) => (Array.isArray(d) ? d : []))
            .catch(() => [] as Cargo[]),
        ]);
        setAsistencias(dataAsist);
        setTrabajadores(dataTrab);
        setCargos(dataCargos);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4500);
  };

  const handleOpenModal = () => {
    setFormData({ ...initialTrabajadorState, id_cargo: cargos[0]?.id_cargo || 0 });
    openModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.name === "id_cargo" ? parseInt(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await mavetApi.registrarTrabajador(formData);
      closeModal();
      showAlert("Trabajador registrado exitosamente.", "success");
      // Refrescar lista
      const dataTrab = await mavetApi.getTrabajadores();
      setTrabajadores(dataTrab);
      setActiveTab("trabajadores");
    } catch (err: any) {
      showAlert(err.message || "Error al registrar el trabajador.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PDF: reporte de asistencia completo
  const handleExportAsistencia = () => {
    if (asistencias.length === 0) { showAlert("No hay registros de asistencia para exportar.", "error"); return; }
    exportarReporteAsistencia(filteredAsistencias);
    showAlert("Reporte de asistencia generado.", "success");
  };

  // PDF: carta de aval para un trabajador específico
  const handleCartaAval = (trabajador: Trabajador) => {
    exportarCartaAvalHoras(trabajador, asistencias);
    showAlert(`Carta de aval de ${trabajador.nombre} ${trabajador.apellido} generada.`, "success");
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de RRHH y Asistencia</h1>
          <p className="text-sm text-gray-500">Personal activo, registros de asistencia y documentos.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportAsistencia}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar Asistencia PDF
          </button>
          <button
            onClick={handleOpenModal}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Registrar Trabajador
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {/* Barra Superior: Tabs + Búsqueda */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button onClick={() => setActiveTab("trabajadores")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "trabajadores" ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Trabajadores
            </button>
            <button onClick={() => setActiveTab("asistencias")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "asistencias" ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Asistencias
            </button>
          </div>
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input type="text" placeholder="Buscar por cédula o nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
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
              {activeTab === "trabajadores" ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                      <th className="px-5 py-4">Cédula</th>
                      <th className="px-5 py-4">Nombres y Apellidos</th>
                      <th className="px-5 py-4">Cargo</th>
                      <th className="px-5 py-4">Teléfono</th>
                      <th className="px-5 py-4">Correo</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4 text-center">Aval</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTrabajadores.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-500"><p className="font-medium">No se encontraron trabajadores</p></td></tr>
                    ) : filteredTrabajadores.map((t) => (
                      <tr key={t.cedula} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-semibold">{t.cedula}</td>
                        <td className="px-5 py-4 font-semibold">{t.nombre} {t.apellido}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{t.cargo}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{t.telefono || "—"}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{t.correo || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{t.estado}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleCartaAval(t)}
                            title="Generar Carta de Aval"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                      <th className="px-5 py-4">Fecha</th>
                      <th className="px-5 py-4">Cédula</th>
                      <th className="px-5 py-4">Nombre y Apellido</th>
                      <th className="px-5 py-4">Cargo</th>
                      <th className="px-5 py-4 text-center border-l border-gray-200 dark:border-gray-700">Ent. Mañana</th>
                      <th className="px-5 py-4 text-center">Sal. Mañana</th>
                      <th className="px-5 py-4 text-center border-l border-gray-200 dark:border-gray-700">Ent. Tarde</th>
                      <th className="px-5 py-4 text-center">Sal. Tarde</th>
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
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-600">{a.salidaManana}</td>
                        <td className="px-5 py-4 text-center font-mono text-xs text-brand-700 dark:text-brand-400 font-medium border-l border-gray-100 dark:border-gray-700">{a.entradaTarde}</td>
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-600">{a.salidaTarde}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <span>Mostrando {activeTab === "trabajadores" ? filteredTrabajadores.length : filteredAsistencias.length} registros</span>
            </div>
          </>
        )}
      </div>

      {/* Modal: Registrar Trabajador */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[640px] p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Registrar Nuevo Trabajador</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Nombres</label>
                <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Ej. Ricardo Andrés" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none" required />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos</label>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Ej. López Martínez" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cédula</label>
                <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="V-12345678" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none" required />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="0414-1234567" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Correo Personal</label>
                <input type="email" name="correo_personal" value={formData.correo_personal} onChange={handleChange} placeholder="ejemplo@correo.com" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
                <select name="id_cargo" value={formData.id_cargo} onChange={handleChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none" required>
                  <option value={0} disabled>Seleccione un cargo...</option>
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <select name="estado" value={formData.estado} onChange={handleChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
              <button type="button" onClick={closeModal} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting || formData.id_cargo === 0} className="flex items-center justify-center min-w-[180px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Guardar Trabajador"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
