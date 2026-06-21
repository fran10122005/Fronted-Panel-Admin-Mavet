import React, { useState, useEffect } from "react";
import { mavetApi, axiosInstance } from "../../services/api";
import { Modal } from "../../components/ui/modal";

export default function Recepcion() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);

  const [formData, setFormData] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    telefono: "",
    institucion_profesion: "",
    
    id_motivo: ""
  });

  const [motivos, setMotivos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Modal para menores
  const [isMenorModalOpen, setIsMenorModalOpen] = useState(false);
  const [menorData, setMenorData] = useState({ nombres: "", apellidos: "", fecha_nacimiento: "" });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) return;
    setIsSearching(true);
    try {
      // Endpoint simulado del frontend, en el real llamaría a mavetApi.buscarPersona
      const res = await axiosInstance.get(`/api/personas/buscar?q=${searchQuery}`);
      const result = res.data;
      if (result.data && result.data.length > 0) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
        showAlert("No se encontró ninguna persona. Puede registrarla ahora.", "error");
      }
    } catch (error) {
      console.error("Error buscando persona", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPersona = (p: any) => {
    setSelectedPersona(p);
    setFormData(prev => ({
      ...prev,
      cedula: p.cedula || "",
      nombres: p.nombres || "",
      apellidos: p.apellidos || "",
      telefono: p.telefono || "",
      fecha_nacimiento: p.fecha_de_nac || ""
    }));
    setSearchResults([]);
    
    if (p.require_cedula_update) {
      showAlert("⚠️ Esta persona ya cumplió 9 años. Por favor, actualice su cédula real.", "error");
    } else {
      showAlert("Persona seleccionada correctamente.", "success");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_motivo) {
      showAlert("El motivo de visita es obligatorio.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Lógica atómica de registro y creación de ingreso
      await mavetApi.registrarIngreso({
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        fecha_de_nac: formData.fecha_nacimiento,
        id_motivo: formData.id_motivo
      });
      showAlert("Acceso registrado exitosamente.", "success");
      setFormData({ cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", institucion_profesion: "", id_motivo: "" });
      setSelectedPersona(null);
      setSearchQuery("");
    } catch (error: any) {
      showAlert(error.message || "Error al registrar ingreso", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrarMenor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await mavetApi.registrarIngreso({
        nombres: menorData.nombres,
        apellidos: menorData.apellidos,
        fecha_de_nac: menorData.fecha_nacimiento,
        id_motivo: formData.id_motivo || 1, // Por defecto
        id_representante_persona: selectedPersona?.id_persona
      });
      showAlert("Menor registrado e ingresado exitosamente.", "success");
      setIsMenorModalOpen(false);
      setMenorData({ nombres: "", apellidos: "", fecha_nacimiento: "" });
    } catch (error: any) {
      showAlert(error.message || "Error al registrar menor", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative">
      {alertInfo.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${alertInfo.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="font-semibold text-sm">
              {alertInfo.type === 'success' ? '✅' : '⚠️'} {alertInfo.message}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recepción MAVET</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel de Búsqueda Resiliente */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            Buscador Global
          </h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:border-brand-500 focus:outline-none" 
              placeholder="Cédula, nombre, tel..." 
            />
            <button 
              onClick={handleSearch}
              className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition"
            >
              {isSearching ? "..." : "Buscar"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2">
              {searchResults.map(p => (
                <div 
                  key={p.id_persona} 
                  onClick={() => selectPersona(p)}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <p className="font-semibold text-gray-800 dark:text-white">{p.nombres} {p.apellidos}</p>
                  <p className="text-sm text-gray-500">{p.cedula || 'Sin cédula'}</p>
                  {p.representante && (
                    <p className="text-xs mt-1 text-brand-600 bg-brand-50 dark:bg-brand-900/30 inline-block px-2 py-0.5 rounded">
                      Acompañado por: {p.representante.nombres} {p.representante.apellidos}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Formulario */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Datos de Ingreso
            </h2>
            {selectedPersona && (!selectedPersona.edad || selectedPersona.edad >= 18) && (
              <button 
                type="button"
                onClick={() => setIsMenorModalOpen(true)}
                className="bg-green-100 text-green-700 hover:bg-green-200 font-semibold py-1.5 px-3 rounded-lg text-sm transition"
              >
                + Registrar Menor Acompañante
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula</label>
                <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" placeholder="Ej. V-12345678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres *</label>
                <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" placeholder="Ej. Ana" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos *</label>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" placeholder="Ej. Silva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Motivo *</label>
                <select name="id_motivo" value={formData.id_motivo} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600">
                  <option value="">Seleccione...</option>
                  {motivos.map(m => (
                    <option key={m.id_motivo} value={m.id_motivo}>{m.descripcion}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedPersona?.menores_asociados && selectedPersona.menores_asociados.length > 0 && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Menores Asociados (Ingreso Rápido)</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPersona.menores_asociados.map((m: any) => (
                    <button type="button" key={m.id_persona} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-brand-200 text-brand-700 dark:text-brand-400 rounded-lg text-sm hover:bg-brand-50 transition">
                      Ingresar a {m.nombres}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
              <span className="text-gray-500 font-mono text-sm">{time}</span>
              <button type="submit" disabled={isSubmitting} className="bg-brand-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-600 transition">
                {isSubmitting ? "Registrando..." : "Registrar Ingreso Principal"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal para Registrar Menor */}
      <Modal isOpen={isMenorModalOpen} onClose={() => setIsMenorModalOpen(false)}>
        <div className="p-2">
          <h3 className="text-lg font-bold mb-4">Registrar Menor Acompañante</h3>
          <p className="text-sm text-gray-600 mb-4">Representante: {selectedPersona?.nombres} {selectedPersona?.apellidos}</p>
          <form onSubmit={handleRegistrarMenor} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Nombres del Menor</label>
              <input required type="text" value={menorData.nombres} onChange={(e) => setMenorData({...menorData, nombres: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Apellidos del Menor</label>
              <input required type="text" value={menorData.apellidos} onChange={(e) => setMenorData({...menorData, apellidos: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Fecha de Nacimiento</label>
              <input required type="date" value={menorData.fecha_nacimiento} onChange={(e) => setMenorData({...menorData, fecha_nacimiento: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Guardar e Ingresar</button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
