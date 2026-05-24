import React, { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { mavetApi } from "../../services/api";

export default function Talleres() {
  const [formData, setFormData] = useState({
    tallerId: "TALLER-PINTURA-01",
    alumnoNombre: "",
    alumnoEdad: "",
    repNombre: "",
    repCedula: "",
    repTelefono: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await mavetApi.inscribirTaller({
        tallerId: formData.tallerId,
        alumno: { nombre: formData.alumnoNombre, edad: formData.alumnoEdad },
        representante: { nombre: formData.repNombre, cedula: formData.repCedula, telefono: formData.repTelefono }
      });
      
      showAlert(response.message, 'success');
      setFormData({ tallerId: formData.tallerId, alumnoNombre: "", alumnoEdad: "", repNombre: "", repCedula: "", repTelefono: "" });
    } catch (error) {
      showAlert("Ocurrió un error al inscribir al alumno.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
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

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Talleres</h1>
          <p className="text-sm text-gray-500">Administración de programas y matrículas.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-medium border border-gray-200 dark:border-gray-700">
            Cupos Disponibles: 12
          </div>
          <button className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors">
            + Crear Taller
          </button>
        </div>
      </div>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Columna 1: Taller */}
          <ComponentCard title="Selección de Taller">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Taller o Curso</label>
                <select 
                  name="tallerId" 
                  value={formData.tallerId} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="TALLER-PINTURA-01">Pintura al Óleo (Tardes)</option>
                  <option value="TALLER-ESCULTURA-01">Escultura Básica (Mañanas)</option>
                  <option value="TALLER-DIBUJO-01">Dibujo Artístico (Sábados)</option>
                </select>
              </div>
            </div>
          </ComponentCard>

          {/* Columna 2: Alumno */}
          <ComponentCard title="Datos del Alumno">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                <input 
                  type="text" 
                  name="alumnoNombre"
                  value={formData.alumnoNombre} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Edad</label>
                <input 
                  type="number" 
                  name="alumnoEdad"
                  value={formData.alumnoEdad} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Ej. 12"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
            </div>
          </ComponentCard>

          {/* Columna 3: Representante */}
          <ComponentCard title="Datos del Representante">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Representante</label>
                <input 
                  type="text" 
                  name="repNombre"
                  value={formData.repNombre} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Ej. Ana Mendoza"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Cédula</label>
                <input 
                  type="text" 
                  name="repCedula"
                  value={formData.repCedula} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Ej. V-12345678"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                <input 
                  type="text" 
                  name="repTelefono"
                  value={formData.repTelefono} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Ej. 0414-1234567"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
            </div>
          </ComponentCard>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center justify-center min-w-[180px] bg-brand-500 text-white font-medium py-3 px-8 rounded-lg shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-70 disabled:cursor-wait"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Inscribir Alumno"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
