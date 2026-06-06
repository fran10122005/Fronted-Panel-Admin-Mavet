import React, { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";

const RegistroPublico: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [existeVisitante, setExisteVisitante] = useState<boolean>(false);
  const [motivos, setMotivos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    cedula: "",
    telefono: "",
    fecha_nacimiento: "",
    institucion: "",
    profesion: "",
    id_motivo: ""
  });

  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(false);

  const [isCheckingAuto, setIsCheckingAuto] = useState(false);
  const [isModoKiosko, setIsModoKiosko] = useState(false);

  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const data = await mavetApi.obtenerMotivos();
        setMotivos(data);
      } catch (error) {
        console.error("Error cargando motivos", error);
      }
    };
    fetchMotivos();

    // Auto-Recordar Cédula (sólo si no estamos en modo kiosko)
    const savedCedula = localStorage.getItem("mavet_cedula");
    if (savedCedula) {
      setFormData((prev) => ({ ...prev, cedula: savedCedula }));
      autoCheckCedula(savedCedula);
    }
  }, []);

  const autoCheckCedula = async (cedulaToValidate: string) => {
    setIsCheckingAuto(true);
    setIsLoadingCheck(true);
    try {
      const result = await mavetApi.checkVisitante(cedulaToValidate);
      setExisteVisitante(result.existe);
      setStep(2);
    } catch (error) {
      console.error("Error comprobando cédula", error);
      setStep(1);
    } finally {
      setIsLoadingCheck(false);
      setIsCheckingAuto(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearCedula = () => {
    localStorage.removeItem("mavet_cedula");
    setFormData((prev) => ({ ...prev, cedula: "" }));
    setExisteVisitante(false);
    setStep(1);
  };

  const handleCheckCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cedula) return;
    setIsLoadingCheck(true);
    
    try {
      const result = await mavetApi.checkVisitante(formData.cedula);
      setExisteVisitante(result.existe);
      setStep(2);
    } catch (error) {
      console.error("Error comprobando cédula", error);
      // Fallback a formulario completo si hay error de conexión
      setExisteVisitante(false);
      setStep(2);
    } finally {
      setIsLoadingCheck(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        cedula: formData.cedula,
        id_motivo: parseInt(formData.id_motivo)
      };

      if (!existeVisitante) {
        payload.nombres = formData.nombre;
        payload.apellidos = formData.apellidos || "";
        payload.telefono = formData.telefono;
        payload.fecha_nacimiento = formData.fecha_nacimiento || "2000-01-01"; // Default si no tiene
        payload.institucion_profesion = formData.institucion || formData.profesion || "";
      }

      await mavetApi.registrarIngreso(payload);
      
      if (isModoKiosko) {
        // En modo kiosko NO guardamos, y limpiamos todo
        localStorage.removeItem("mavet_cedula");
        setFormData({
          nombre: "", apellidos: "", cedula: "", telefono: "", 
          fecha_nacimiento: "", institucion: "", profesion: "", id_motivo: ""
        });
        setExisteVisitante(false);
      } else {
        // Guardar cédula en el navegador para el auto-recordatorio
        localStorage.setItem("mavet_cedula", formData.cedula);
        setFormData({
          nombre: "", apellidos: "", cedula: formData.cedula, telefono: "", 
          fecha_nacimiento: "", institucion: "", profesion: "", id_motivo: ""
        });
      }

      setStep(1);
      
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error al registrar visitante:", error);
      alert("Ocurrió un error al registrar el acceso. Por favor, intente nuevamente.");
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
          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleCheckCedula}>
              <div>
                <label htmlFor="cedula" className="block mb-1.5 text-sm font-medium text-gray-700">Cédula de Identidad</label>
                <input 
                  id="cedula"
                  name="cedula"
                  type="text" 
                  value={formData.cedula}
                  onChange={handleChange}
                  disabled={isLoadingCheck}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                  placeholder="Ej: V-12345678" 
                  required 
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isLoadingCheck || !formData.cedula}
                  className="w-full flex justify-center items-center bg-brand-500 text-white py-3.5 px-4 rounded-lg font-semibold text-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/30 transition-all active:scale-[0.98] shadow-md shadow-brand-500/20 disabled:opacity-70 min-h-[56px]"
                >
                  {isLoadingCheck ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Continuar"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5 animate-fade-in-up" onSubmit={handleSubmit}>
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Cédula: {formData.cedula}
                  <button type="button" onClick={handleClearCedula} className="ml-1 text-brand-600 hover:text-brand-800">
                    (Cambiar cédula)
                  </button>
                </span>
                {existeVisitante && (
                  <p className="text-sm text-brand-600 mt-2 font-medium">¡Bienvenido de nuevo! Solo necesitamos conocer el motivo de su visita.</p>
                )}
              </div>

              {!existeVisitante && (
                <>
                  <div>
                    <label htmlFor="nombre" className="block mb-1.5 text-sm font-medium text-gray-700">Nombres</label>
                    <input 
                      id="nombre"
                      name="nombre"
                      type="text" 
                      value={formData.nombre}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                      placeholder="Ej: Juan" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="apellidos" className="block mb-1.5 text-sm font-medium text-gray-700">Apellidos</label>
                    <input 
                      id="apellidos"
                      name="apellidos"
                      type="text" 
                      value={formData.apellidos}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                      placeholder="Ej: Pérez" 
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
                      />
                    </div>
                    <div>
                      <label htmlFor="fecha_nacimiento" className="block mb-1.5 text-sm font-medium text-gray-700">Fecha Nac.</label>
                      <input 
                        id="fecha_nacimiento"
                        name="fecha_nacimiento"
                        type="date" 
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="institucion" className="block mb-1.5 text-sm font-medium text-gray-700">Institución / Profesión</label>
                    <input 
                      id="institucion"
                      name="institucion"
                      type="text" 
                      value={formData.institucion}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                      placeholder="Ej: Estudiante ULA" 
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="id_motivo" className="block mb-1.5 text-sm font-medium text-gray-700">Motivo de la Visita</label>
                <select 
                  id="id_motivo"
                  name="id_motivo"
                  value={formData.id_motivo}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow disabled:opacity-50" 
                  required
                >
                  <option value="" disabled>Seleccione un motivo...</option>
                  {motivos.map((m: any) => (
                    <option key={m.id_motivo} value={m.id_motivo}>
                      {m.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.id_motivo}
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
          )}
        </div>

        {/* MODO KIOSKO / RECEPCIÓN */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-center">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={isModoKiosko}
              onChange={(e) => {
                setIsModoKiosko(e.target.checked);
                if (e.target.checked) handleClearCedula();
              }}
              className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
            />
            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
              Modo Personal del Museo (Registrar a otros / No recordar datos)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default RegistroPublico;
