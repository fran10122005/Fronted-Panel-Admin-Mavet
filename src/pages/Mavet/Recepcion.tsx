import React, { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";

export default function Recepcion() {
  const [formData, setFormData] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    edad: "",
    telefono: "",
    institucion_profesion: "",
    id_motivo: ""
  });

  const [motivos, setMotivos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Motivos
  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const data = await mavetApi.obtenerMotivos();
        setMotivos(data);
      } catch (error) {
        console.error("Error al cargar motivos", error);
      }
    };
    fetchMotivos();
  }, []);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCedulaBlur = async () => {
    if (!formData.cedula || formData.cedula.length < 5) return;
    
    try {
      setIsChecking(true);
      const res = await mavetApi.checkVisitante(formData.cedula);
      if (res.existe && res.visitante) {
        // Autocompletar datos
        setFormData(prev => ({
          ...prev,
          nombres: res.visitante.nombres || "",
          apellidos: res.visitante.apellidos || "",
          telefono: res.visitante.telefono || "",
          institucion_profesion: res.visitante.institucion_profesion || ""
        }));
        showAlert("Visitante recurrente encontrado. Datos autocompletados.", "success");
      }
    } catch (error) {
      console.error("Error comprobando visitante", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_motivo) {
      showAlert("El motivo de visita es obligatorio.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await mavetApi.registrarIngreso(formData);
      showAlert(response.message || "Acceso registrado exitosamente.", "success");
      // Reset form
      setFormData({
        cedula: "",
        nombres: "",
        apellidos: "",
        edad: "",
        telefono: "",
        institucion_profesion: "",
        id_motivo: ""
      });
    } catch (error: any) {
      showAlert(error.message || "Error al registrar ingreso", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      {/* Alerta flotante */}
      {alertInfo.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${alertInfo.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="font-semibold text-sm">
              {alertInfo.type === 'success' ? '✅' : '⚠️'} {alertInfo.message}
            </span>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recepción y Visitantes</h1>

      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          Check-in Rápido de Visitantes
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula o Pasaporte *</label>
              <input 
                type="text" 
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                onBlur={handleCedulaBlur}
                required
                disabled={isSubmitting}
                className="w-full border border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 focus:border-brand-500 focus:outline-none" 
                placeholder="Ej. V-12345678" 
              />
              {isChecking && (
                <div className="absolute right-3 top-9 w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edad</label>
              <input 
                type="number" 
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 focus:border-brand-500 focus:outline-none" 
                placeholder="Ej. 25" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres *</label>
              <input 
                type="text" 
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full border border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 focus:border-brand-500 focus:outline-none" 
                placeholder="Ej. Ana" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos *</label>
              <input 
                type="text" 
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full border border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 focus:border-brand-500 focus:outline-none" 
                placeholder="Ej. Silva" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
              <input 
                type="tel" 
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 focus:border-brand-500 focus:outline-none" 
                placeholder="Ej. 0424-1234567" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institución / Profesión</label>
              <input 
                type="text" 
                name="institucion_profesion"
                value={formData.institucion_profesion}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 focus:border-brand-500 focus:outline-none" 
                placeholder="Ej. Estudiante LUZ" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Motivo de Visita *</label>
              <select 
                name="id_motivo"
                value={formData.id_motivo}
                onChange={handleChange}
                required
                disabled={isSubmitting || motivos.length === 0}
                className="w-full border border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 bg-white focus:border-brand-500 focus:outline-none text-lg"
              >
                <option value="">Seleccione el motivo de la visita...</option>
                {motivos.map(m => (
                  <option key={m.id_motivo} value={m.id_motivo}>{m.descripcion}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-gray-700 mt-6 flex justify-between items-center">
            <div className="text-gray-600 dark:text-gray-300 text-sm font-mono bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded border border-gray-300 dark:border-gray-600">
              Hora de registro: <span className="font-bold text-gray-900 dark:text-white">{time}</span>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center justify-center bg-brand-500 text-white font-bold py-3 px-8 rounded shadow hover:bg-brand-600 border border-brand-600 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors text-lg disabled:opacity-70 disabled:cursor-wait min-w-[200px]"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Registrar Ingreso"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
