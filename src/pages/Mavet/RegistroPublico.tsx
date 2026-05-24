import React, { useState } from "react";
import { mavetApi } from "../../services/api";
import { RegistroVisitantePayload } from "../../types";

const RegistroPublico: React.FC = () => {
  const [formData, setFormData] = useState<RegistroVisitantePayload>({
    nombre: "",
    cedula: "",
    telefono: "",
    edad: "",
    institucion: "",
    profesion: "",
  });

  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await mavetApi.registrarVisitante(formData);
      
      setFormData({
        nombre: "",
        cedula: "",
        telefono: "",
        edad: "",
        institucion: "",
        profesion: "",
      });
      
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error al registrar visitante:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Alerta de Éxito Flotante */}
      {showAlert && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-fade-in-down">
          <div className="flex w-full items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.9331 5.3999L6.13313 10.1999L4.06647 8.13324" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div>
                <h5 className="text-sm font-semibold text-green-800">¡Registro Exitoso!</h5>
                <p className="text-xs text-green-600">Bienvenido al museo MAVET.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-brand-500 px-6 py-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">MAVET</h1>
          <h2 className="text-lg font-medium opacity-90">Registro de Visitantes</h2>
          <p className="text-sm mt-2 opacity-80">Complete el formulario para registrar su acceso</p>
        </div>

        <div className="p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nombre" className="block mb-1.5 text-sm font-medium text-gray-700">Nombre Completo</label>
              <input 
                id="nombre"
                name="nombre"
                type="text" 
                value={formData.nombre}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                placeholder="Ej: Juan Pérez" 
                required 
              />
            </div>

            <div>
              <label htmlFor="cedula" className="block mb-1.5 text-sm font-medium text-gray-700">Cédula de Identidad</label>
              <input 
                id="cedula"
                name="cedula"
                type="text" 
                value={formData.cedula}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                placeholder="Ej: V-12345678" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="telefono" className="block mb-1.5 text-sm font-medium text-gray-700">Teléfono</label>
                <input 
                  id="telefono"
                  name="telefono"
                  type="tel" 
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                  placeholder="0412-1234567" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="edad" className="block mb-1.5 text-sm font-medium text-gray-700">Edad</label>
                <input 
                  id="edad"
                  name="edad"
                  type="number" 
                  min="1"
                  value={formData.edad}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                  placeholder="Ej: 25" 
                  required 
                />
              </div>
            </div>

            <div>
              <label htmlFor="institucion" className="block mb-1.5 text-sm font-medium text-gray-700">Institución</label>
              <input 
                id="institucion"
                name="institucion"
                type="text" 
                value={formData.institucion}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                placeholder="Ej: ULA / UNET / Ninguna" 
              />
            </div>

            <div>
              <label htmlFor="profesion" className="block mb-1.5 text-sm font-medium text-gray-700">Profesión / Ocupación</label>
              <input 
                id="profesion"
                name="profesion"
                type="text" 
                value={formData.profesion}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                placeholder="Ej: Estudiante" 
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center items-center bg-brand-500 text-white py-3.5 px-4 rounded-lg font-semibold text-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/30 transition-all active:scale-[0.98] shadow-md shadow-brand-500/20 disabled:opacity-70 disabled:cursor-wait min-h-[56px]"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Registrar Acceso"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroPublico;
