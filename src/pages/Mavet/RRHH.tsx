import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { RegistroAsistencia, Trabajador } from "../../types";

const initialTrabajadorState: Trabajador = {
  cedula: "",
  nombre: "",
  apellido: "",
  telefono: "",
  correo: "",
  cargo: "",
  estado: "Activo"
};

export default function RRHH() {
  const { isOpen, openModal, closeModal } = useModal();
  
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Búsqueda simple
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal de Nuevo Trabajador
  const [formData, setFormData] = useState<Trabajador>(initialTrabajadorState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert state
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mavetApi.getAsistencia();
        setAsistencias(data);
      } catch (error) {
        console.error("Error al cargar datos de RRHH:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  const handleOpenModal = () => {
    setFormData(initialTrabajadorState);
    openModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitTrabajador = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await mavetApi.registrarTrabajador(formData);
      closeModal();
      showAlert(response.message, 'success');
    } catch (error) {
      showAlert("Error al registrar el trabajador.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = () => {
    // Simulación de descarga de PDF
    showAlert("Generando Carta de Aval de Horas...", 'success');
    setTimeout(() => {
      showAlert("Reporte PDF descargado exitosamente.", 'success');
    }, 2000);
  };

  // Filtrado reactivo de asistencias
  const filteredAsistencias = useMemo(() => {
    return asistencias.filter((registro) => {
      return (
        registro.trabajadorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.cedula.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [asistencias, searchTerm]);

  return (
    <div className="space-y-6 relative">
      {/* Floating Alert */}
      {alertInfo.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${alertInfo.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="font-semibold text-sm">
              {alertInfo.type === 'success' ? '✅' : '⚠️'} {alertInfo.message}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de RRHH y Asistencia</h1>
          <p className="text-sm text-gray-500">Consolidado de firmas y aval de horas del personal.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExportPDF}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Generar Carta de Horas / Exportar PDF
          </button>
          <button 
            onClick={handleOpenModal}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            Registrar Trabajador
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        
        {/* Barra de Búsqueda */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por cédula o nombre del trabajador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando registros de asistencia...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Cédula</th>
                    <th className="px-5 py-4">Nombre y Apellido</th>
                    <th className="px-5 py-4">Cargo</th>
                    <th className="px-5 py-4 text-center border-l border-gray-200 dark:border-gray-700">Entrada Mañana</th>
                    <th className="px-5 py-4 text-center">Salida Mañana</th>
                    <th className="px-5 py-4 text-center border-l border-gray-200 dark:border-gray-700">Entrada Tarde</th>
                    <th className="px-5 py-4 text-center">Salida Tarde</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAsistencias.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-base font-medium">No se encontraron registros</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAsistencias.map((registro) => (
                      <tr key={registro.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{registro.fecha}</td>
                        <td className="px-5 py-4 font-mono text-xs font-semibold">{registro.cedula}</td>
                        <td className="px-5 py-4 font-semibold">{registro.trabajadorNombre}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{registro.cargo}</td>
                        <td className="px-5 py-4 text-center font-mono text-xs text-brand-700 dark:text-brand-400 font-medium border-l border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">{registro.entradaManana}</td>
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/30">{registro.salidaManana}</td>
                        <td className="px-5 py-4 text-center font-mono text-xs text-brand-700 dark:text-brand-400 font-medium border-l border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">{registro.entradaTarde}</td>
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">{registro.salidaTarde}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400 gap-4 mt-auto">
              <span>Mostrando {filteredAsistencias.length} registros</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">Anterior</button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal: Registro de Nuevo Trabajador */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Registrar Nuevo Trabajador</h3>
          
          <form onSubmit={handleSubmitTrabajador} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  placeholder="V-12345678"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="0414-1234567"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
                <select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                >
                  <option value="">Seleccione un cargo...</option>
                  <option value="Curador">Curador</option>
                  <option value="Bibliotecario">Bibliotecario</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Guía de Museo">Guía de Museo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center min-w-[200px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Guardar y Generar Código QR"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
