import React, { useState, useEffect } from "react";
import { mavetApi, axiosInstance } from "../../services/api";
import { Modal } from "../../components/ui/modal";
import { exportarQRPublico } from "../../services/pdf.service";
import toast from "react-hot-toast";

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
    id_motivo: "",
    cantidad_acompanantes: 0
  });

  const [isVisitaInstitucional, setIsVisitaInstitucional] = useState(false);

  const [motivos, setMotivos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Dashboard state
  const [eventosHoy, setEventosHoy] = useState<any[]>([]);
  const [visitantesFrecuentes, setVisitantesFrecuentes] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Modal de Código QR Público
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const publicRegistrationUrl = `${window.location.origin}/registro-visitante`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicRegistrationUrl)}`;

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

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const eventos = await mavetApi.getAgendaPublica();
      const hoyStr = new Date().toISOString().split('T')[0];
      const filtrados = eventos.filter((e: any) => e.fecha?.startsWith(hoyStr));
      setEventosHoy(filtrados);

      const now = new Date();
      const topVisitantes = await mavetApi.getTopVisitantes(now.getMonth() + 1, now.getFullYear());
      setVisitantesFrecuentes(topVisitantes.slice(0, 10)); // Top 10
    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        toast.error("No se encontró ninguna persona. Puede registrarla ahora.");
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
      toast.error("⚠️ Esta persona ya cumplió 9 años. Por favor, actualice su cédula real.");
    } else {
      toast.success("Persona seleccionada correctamente.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_motivo) {
      toast.error("El motivo de visita es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalMotivo = '';
      let finalTaller: string | undefined = undefined;

      if (formData.id_motivo.startsWith('evento_')) {
        finalTaller = formData.id_motivo.split('_')[1];
        const motivoTaller = motivos.find(m => m.descripcion.toLowerCase().includes('taller') || m.descripcion.toLowerCase().includes('educa'));
        finalMotivo = motivoTaller ? motivoTaller.id_motivo : (motivos[0]?.id_motivo || '');
      } else if (formData.id_motivo === 'motivo_entrega_obra' || formData.id_motivo === 'motivo_otro') {
        finalMotivo = formData.id_motivo;
      } else {
        finalMotivo = formData.id_motivo.split('_')[1];
      }

      // Lógica atómica de registro y creación de ingreso
      await mavetApi.registrarIngreso({
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        fecha_de_nac: formData.fecha_nacimiento,
        id_motivo: finalMotivo,
        id_taller: finalTaller,
        cantidad_acompanantes: isVisitaInstitucional ? Number(formData.cantidad_acompanantes) : 0
      });
      toast.success("Acceso registrado exitosamente.");
      setFormData({ cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", institucion_profesion: "", id_motivo: "", cantidad_acompanantes: 0 });
      setIsVisitaInstitucional(false);
      setSelectedPersona(null);
      setSearchQuery("");
      fetchDashboardData(); // Refrescar ranking
    } catch (error: any) {
      toast.error(error.message || "Error al registrar ingreso");
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
      toast.success("Menor registrado e ingresado exitosamente.");
      setIsMenorModalOpen(false);
      setMenorData({ nombres: "", apellidos: "", fecha_nacimiento: "" });
    } catch (error: any) {
      toast.error(error.message || "Error al registrar menor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recepción MAVET</h1>
        <button 
          onClick={() => setIsQrModalOpen(true)}
          className="bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60 font-semibold py-2 px-4 rounded-lg text-sm transition shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
          </svg>
          Generar QR Público
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda (Buscador y Formulario) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Panel de Búsqueda Resiliente */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
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
                className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition flex items-center gap-1"
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Datos de Ingreso
              </h2>
              {selectedPersona && (!selectedPersona.edad || selectedPersona.edad >= 18) && (
                <button 
                  type="button"
                  onClick={() => setIsMenorModalOpen(true)}
                  className="bg-green-100 text-green-700 hover:bg-green-200 font-semibold py-1.5 px-3 rounded-lg text-sm transition flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Registrar Menor Acompañante
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula</label>
                  <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" placeholder="Ej. V-12345678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres *</label>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" placeholder="Ej. Ana" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos *</label>
                  <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" placeholder="Ej. Silva" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Nacimiento</label>
                  <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="show-date-picker w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Motivo *</label>
                    <select name="id_motivo" value={formData.id_motivo} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-brand-500 focus:outline-none">
                    <option value="">Seleccione...</option>
                    {motivos.map(m => (
                      <option key={`m_${m.id_motivo}`} value={`motivo_${m.id_motivo}`}>{m.descripcion}</option>
                    ))}
                    <option value="motivo_entrega_obra">Entrega de Obra</option>
                    <option value="motivo_otro">Otro</option>
                    {eventosHoy.length > 0 && (
                      <optgroup label="Eventos y Talleres de Hoy">
                        {eventosHoy.map((e, idx) => (
                          <option key={`e_${idx}`} value={`evento_${e.id.split('-')[1]}`}>
                            {e.titulo} {e.hora_inicio ? `(${e.hora_inicio.substring(0,5)})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="visitaInst" 
                      checked={isVisitaInstitucional} 
                      onChange={(e) => setIsVisitaInstitucional(e.target.checked)}
                      className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="visitaInst" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                      Es Visita Institucional / Grupal
                    </label>
                  </div>
                  {isVisitaInstitucional && (
                    <div className="w-full sm:w-1/2 mt-1 animate-fade-in">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad de Acompañantes / Niños</label>
                      <input 
                        type="number" 
                        min="1" 
                        name="cantidad_acompanantes" 
                        value={formData.cantidad_acompanantes} 
                        onChange={handleChange} 
                        className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" 
                        placeholder="Ej. 30" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedPersona?.menores_asociados && selectedPersona.menores_asociados.length > 0 && (
                <div className="mt-4 bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-200 dark:border-brand-800/50">
                  <h4 className="text-sm font-bold text-brand-800 dark:text-brand-300 mb-2">Menores Asociados (Ingreso Rápido)</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersona.menores_asociados.map((m: any) => (
                      <button type="button" key={m.id_persona} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-brand-200 text-brand-700 dark:text-brand-400 rounded-lg text-sm hover:bg-brand-100 transition shadow-sm">
                        Ingresar a {m.nombres}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-5 mt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 font-mono text-sm tracking-wider flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  {time}
                </span>
                <button type="submit" disabled={isSubmitting} className="bg-brand-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-brand-700 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Registrando..." : "Registrar Ingreso"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna Derecha (Dashboard Lateral) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Panel Agenda del Día */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-100 dark:bg-brand-900/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
              <span className="text-xl">📅</span> Agenda de Hoy
            </h2>
            {isLoadingDashboard ? (
              <div className="animate-pulse space-y-4">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ) : eventosHoy.length > 0 ? (
              <ul className="space-y-3 relative z-10">
                {eventosHoy.map((evt, idx) => (
                  <li key={idx} className="p-3 border-l-4 border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 dark:border-brand-500 rounded-r-lg">
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{evt.titulo}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{evt.institucion || 'MAVET'}</p>
                    <p className="text-xs font-mono text-brand-600 dark:text-brand-400 mt-1.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      {evt.hora_inicio ? evt.hora_inicio.substring(0,5) : 'Todo el día'} - {evt.hora_fin ? evt.hora_fin.substring(0,5) : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-6">No hay eventos planificados para hoy.</p>
            )}
          </div>

          {/* Panel Visitantes Frecuentes */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌟</span> Visitantes Frecuentes
              </div>
            </h2>
            {isLoadingDashboard ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ) : visitantesFrecuentes.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {visitantesFrecuentes.map((v, idx) => (
                  <div key={idx} className="flex flex-col p-3 border border-gray-100 dark:border-gray-700/60 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate pr-2">
                        {v.nombre}
                      </p>
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded shadow-sm shrink-0">
                        {v.totalVisitas} visitas
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Última vez: {new Date(v.ultimaVisita).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-6">No hay datos suficientes.</p>
            )}
          </div>
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
              <input required type="date" value={menorData.fecha_nacimiento} onChange={(e) => setMenorData({...menorData, fecha_nacimiento: e.target.value})} className="show-date-picker w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Guardar e Ingresar</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Código QR */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
        <div className="p-4 flex flex-col items-center text-center">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">QR de Auto-Ingreso</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Imprima este código y colóquelo en la entrada. Los visitantes podrán escanearlo para registrar su acceso automáticamente.
          </p>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <img 
              src={qrImageUrl} 
              alt="Código QR de Auto Ingreso" 
              className="w-64 h-64 object-contain"
            />
          </div>
          
          <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all select-all">
              {publicRegistrationUrl}
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <button 
              type="button" 
              onClick={() => setIsQrModalOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
            >
              Cerrar
            </button>
            <button 
              type="button" 
              onClick={() => exportarQRPublico(qrImageUrl, publicRegistrationUrl)}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-bold shadow-sm inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir QR
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
