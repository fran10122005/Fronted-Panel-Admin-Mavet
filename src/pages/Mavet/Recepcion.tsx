import React, { useState, useEffect } from "react";
import { mavetApi, axiosInstance } from "../../services/api";
import { Modal } from "../../components/ui/modal";
import { exportarQRPublico } from "../../services/pdf.service";
import toast from "react-hot-toast";
import { limitNumericInput } from "../../utils/validation";
import AsistenciaModal from "../../components/AsistenciaModal";

export default function Recepcion() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);

  const [formData, setFormData] = useState({
    nacionalidad: "V-",
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
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Ingresos de hoy
  const [ingresosHoy, setIngresosHoy] = useState<any[]>([]);
  const [isLoadingIngresos, setIsLoadingIngresos] = useState(false);
  const [showAllIngresos, setShowAllIngresos] = useState(false);
  const INGRESOS_PAGE_SIZE = 5;

  // Modal de Código QR Público
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const publicRegistrationUrl = `${window.location.origin}/registro-visitante`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicRegistrationUrl)}`;

  // Modal para menores
  const [isMenorModalOpen, setIsMenorModalOpen] = useState(false);
  const [menorData, setMenorData] = useState({ nombres: "", apellidos: "", fecha_nacimiento: "", cedula: "" });

  // Modal Asistencia Personal
  const [isAsistenciaModalOpen, setIsAsistenciaModalOpen] = useState(false);

  const getAge = (dateStr: string) => {
    if (!dateStr) return -1;
    const birth = new Date(dateStr);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  };

  const ageMenor = getAge(menorData.fecha_nacimiento);

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
      const now = new Date();
      const hoyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const filtrados = eventos.filter((e: any) => {
        const fecha = e.fecha || e.fecha_uso || e.fecha_solicitada || e.start || e.date || "";
        return fecha.startsWith(hoyStr);
      });
      setEventosHoy(filtrados);
    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchIngresosHoy = async () => {
    setIsLoadingIngresos(true);
    try {
      const now = new Date();
      const hoyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const result = await mavetApi.getTodosIngresos(1, 200, hoyStr);
      setIngresosHoy(result.data || []);
    } catch {
      setIngresosHoy([]);
    } finally {
      setIsLoadingIngresos(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchIngresosHoy();
  }, []);
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => handleSearch(), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) return;
    setIsSearching(true);
    try {
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
      nacionalidad: p.cedula ? (p.cedula.startsWith("E-") ? "E-" : "V-") : "V-",
      cedula: p.cedula ? p.cedula.replace(/^[VE]-/, "") : "",
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
    if (e.target.name === "cedula") {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 8) value = value.slice(0, 8);
      const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setFormData({ ...formData, cedula: formatted });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres || !formData.nombres.trim()) {
      toast.error("El campo Nombres es obligatorio.");
      return;
    }
    if (!formData.apellidos || !formData.apellidos.trim()) {
      toast.error("El campo Apellidos es obligatorio.");
      return;
    }
    if (!formData.id_motivo) {
      toast.error("El motivo de visita es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalMotivo = '';
      let finalTaller: string | undefined = undefined;
      let finalSolicitud: string | undefined = undefined;

      if (formData.id_motivo.startsWith('evento_')) {
        const rawId = formData.id_motivo.split('_')[1];
        if (rawId.startsWith('TAL-')) {
          finalTaller = rawId;
        } else {
          finalSolicitud = rawId;
        }
        const motivoTaller = motivos.find(m => m.descripcion.toLowerCase().includes('taller') || m.descripcion.toLowerCase().includes('educa'));
        finalMotivo = motivoTaller ? motivoTaller.id_motivo : (motivos[0]?.id_motivo || '');
      } else {
        finalMotivo = formData.id_motivo.split('_')[1];
      }

      // Lógica atómica de registro y creación de ingreso
      const ingresoPayload: any = {
        cedula: formData.cedula ? `${formData.nacionalidad}${formData.cedula}` : "",
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        fecha_de_nac: formData.fecha_nacimiento,
        id_motivo: finalMotivo,
        cantidad_acompanantes: isVisitaInstitucional ? Number(formData.cantidad_acompanantes) : 0
      };
      
      if (finalTaller && finalTaller.startsWith('TAL-')) {
        ingresoPayload.id_taller = finalTaller;
      }
      if (finalSolicitud) {
        ingresoPayload.id_solicitud = finalSolicitud;
      }

      await mavetApi.registrarIngreso(ingresoPayload);
      toast.success("Acceso registrado exitosamente.");
      setFormData({ nacionalidad: "V-", cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", institucion_profesion: "", id_motivo: "", cantidad_acompanantes: 0 });
      setIsVisitaInstitucional(false);
      setSelectedPersona(null);
      setSearchQuery("");
      fetchDashboardData();
      fetchIngresosHoy();
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
      const menorPayload: any = {
        nombres: menorData.nombres,
        apellidos: menorData.apellidos,
        fecha_de_nac: menorData.fecha_nacimiento,
        id_motivo: formData.id_motivo.replace('motivo_', '') || "MVI-00001",
        id_representante_persona: selectedPersona?.id_persona,
        cedula: menorData.cedula ? menorData.cedula : undefined
      };
      await mavetApi.registrarIngreso(menorPayload);
      toast.success("Menor registrado e ingresado exitosamente.");
      setIsMenorModalOpen(false);
      setMenorData({ nombres: "", apellidos: "", fecha_nacimiento: "", cedula: "" });
      fetchIngresosHoy();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar menor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIngresarMenorAsociado = async (menor: any) => {
    if (!selectedPersona) return;
    setIsSubmitting(true);
    try {
      const edad = getAge(menor.fecha_de_nac);
      if (edad >= 12) {
        toast.error(`${menor.nombres} tiene ${edad} años. Debe registrarse como visitante regular.`);
        return;
      }
      const payload: any = {
        nombres: menor.nombres,
        apellidos: menor.apellidos,
        fecha_de_nac: menor.fecha_de_nac,
        cedula: menor.cedula || undefined,
        id_motivo: formData.id_motivo.replace('motivo_', '') || "MVI-00001",
        id_representante_persona: selectedPersona.id_persona,
      };
      await mavetApi.registrarIngreso(payload);
      toast.success(`${menor.nombres} ingresado exitosamente.`);
      fetchIngresosHoy();
    } catch (error: any) {
      toast.error(error.message || `Error al ingresar a ${menor.nombres}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recepción MAVET</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAsistenciaModalOpen(true)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Asistencia Personal
          </button>
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
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 pr-10 focus:border-brand-500 focus:outline-none transition"
                  placeholder="Cédula, nombre, tel..."
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={searchQuery.length < 3}
                className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buscar
              </button>
            </div>
            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Escribe al menos 3 caracteres para buscar automáticamente.</p>
            )}

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2 scroll-smooth">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{searchResults.length} resultado(s) encontrado(s)</p>
                {searchResults.map(p => (
                  <div
                    key={p.id_persona}
                    onClick={() => selectPersona(p)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">{p.nombres} {p.apellidos}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{p.cedula || 'Sin cédula'}</p>
                    {p.representante && (
                      <p className="text-xs mt-1 text-brand-600 bg-brand-50 dark:bg-brand-900/30 inline-block px-2 py-0.5 rounded">
                        Acompañado por: {p.representante.nombres} {p.representante.apellidos}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-3 text-center">Sin resultados. Puedes registrar una persona nueva en el formulario.</p>
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
              <div className="flex items-center gap-2">
                {selectedPersona && (
                  <span className="text-xs bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2.5 py-1 rounded-full font-medium">
                    {selectedPersona.nombres} {selectedPersona.apellidos}
                  </span>
                )}
                {selectedPersona && (!selectedPersona.edad || selectedPersona.edad >= 18) && (
                  <button
                    type="button"
                    onClick={() => setIsMenorModalOpen(true)}
                    className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 font-semibold py-1.5 px-3 rounded-lg text-sm transition flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Registrar Menor
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula</label>
                  <div className="flex">
                    <select
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleChange}
                      className="border rounded-l-lg px-2 py-2 bg-gray-50 dark:bg-gray-600 dark:border-gray-600 focus:outline-none dark:text-white"
                    >
                      <option value="V-">V-</option>
                      <option value="E-">E-</option>
                    </select>
                    <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="w-full border-y border-r rounded-r-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" placeholder="Ej. 31.243.332" />
                  </div>
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
                  <input type="date" name="fecha_nacimiento" min="1900-01-01" max={new Date().toISOString().split("T")[0]} value={formData.fecha_nacimiento} onChange={handleChange} className="show-date-picker w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} onKeyDown={limitNumericInput} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:border-brand-500 focus:outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Motivo *</label>
                  <select name="id_motivo" value={formData.id_motivo} onChange={handleChange} required style={{ colorScheme: 'dark' }} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-brand-500 focus:outline-none">
                    <option value="">Seleccione...</option>
                    {motivos.map(m => (
                      <option key={`m_${m.id_motivo}`} value={`motivo_${m.id_motivo}`}>{m.nombre}</option>
                    ))}
                    {eventosHoy.length > 0 && (
                      <optgroup label="Eventos y Talleres de Hoy">
                        {eventosHoy.map((e, idx) => {
                          const parts = e.id.split('-');
                          const fullId = parts.length > 2 ? parts.slice(1).join('-') : parts[1];
                          return (
                            <option key={`e_${idx}`} value={`evento_${fullId}`}>
                              {e.titulo} {e.hora_inicio ? `(${e.hora_inicio.substring(0, 5)})` : ''}
                            </option>
                          );
                        })}
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
                        min={0}
                        name="cantidad_acompanantes"
                        value={formData.cantidad_acompanantes}
                        onChange={handleChange}
                        onKeyDown={limitNumericInput}
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
                      <button
                        type="button"
                        key={m.id_persona}
                        disabled={isSubmitting}
                        onClick={() => handleIngresarMenorAsociado(m)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-brand-200 text-brand-700 dark:text-brand-400 rounded-lg text-sm hover:bg-brand-100 dark:hover:bg-brand-900/40 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
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
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData({ nacionalidad: "V-", cedula: "", nombres: "", apellidos: "", fecha_nacimiento: "", telefono: "", institucion_profesion: "", id_motivo: "", cantidad_acompanantes: 0 });
                      setSelectedPersona(null);
                      setSearchQuery("");
                      setIsVisitaInstitucional(false);
                    }} 
                    className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-bold py-2.5 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-md"
                  >
                    Limpiar Formulario
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-brand-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-brand-700 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? "Registrando..." : "Registrar Ingreso"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Columna Derecha (Dashboard Lateral) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Panel Agenda del Día */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-100 dark:bg-brand-900/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="text-xl">📅</span> Agenda de Hoy
                {eventosHoy.length > 0 && (
                  <span className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 px-2 py-0.5 rounded-full font-mono">
                    {eventosHoy.length}
                  </span>
                )}
              </h2>
              <button
                onClick={fetchDashboardData}
                disabled={isLoadingDashboard}
                className="text-gray-400 hover:text-brand-500 dark:text-gray-500 dark:hover:text-brand-400 transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Actualizar agenda"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${isLoadingDashboard ? 'animate-spin' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
              </button>
            </div>
            {isLoadingDashboard ? (
              <div className="animate-pulse space-y-4">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
                      {evt.hora_inicio ? evt.hora_inicio.substring(0, 5) : 'Todo el día'} - {evt.hora_fin ? evt.hora_fin.substring(0, 5) : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No hay eventos planificados para hoy.</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Usa el módulo de Agenda para programar actividades.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Ingresos del día */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Ingresos de Hoy
            {ingresosHoy.length > 0 && (
              <span className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 px-2 py-0.5 rounded-full font-mono">
                {ingresosHoy.length}
              </span>
            )}
          </h2>
          {!isLoadingIngresos && ingresosHoy.length > INGRESOS_PAGE_SIZE && (
            <button
              onClick={() => setShowAllIngresos(!showAllIngresos)}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition"
            >
              {showAllIngresos ? 'Ver menos' : `Ver más (${ingresosHoy.length - INGRESOS_PAGE_SIZE} restantes)`}
            </button>
          )}
        </div>

        {isLoadingIngresos ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ) : ingresosHoy.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2.5 pr-3 font-medium">Nombre</th>
                  <th className="pb-2.5 pr-3 font-medium">Cédula</th>
                  <th className="pb-2.5 pr-3 font-medium">Hora</th>
                  <th className="pb-2.5 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {(showAllIngresos ? ingresosHoy : ingresosHoy.slice(0, INGRESOS_PAGE_SIZE)).map((i: any, idx: number) => (
                  <tr key={i.id_ingreso || idx} className="border-b border-gray-50 dark:border-gray-700/40 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {i.Persona?.nombres || ''} {i.Persona?.apellidos || ''}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{i.Persona?.cedula || '-'}</td>
                    <td className="py-2.5 pr-3 text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                      {i.fecha_hora_entrada
                        ? new Date(i.fecha_hora_entrada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="py-2.5 text-gray-500 dark:text-gray-400">{i.Motivo?.descripcion || i.motivo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-6">No se han registrado ingresos hoy.</p>
        )}
      </div>

      {/* Modal para Registrar Menor */}
      <Modal isOpen={isMenorModalOpen} onClose={() => setIsMenorModalOpen(false)}>
        <div className="p-2">
          <h3 className="text-lg font-bold mb-4 dark:text-gray-200">Registrar Menor Acompañante</h3>
          <p className="text-sm text-gray-600 mb-4 dark:text-gray-200">Representante: {selectedPersona?.nombres} {selectedPersona?.apellidos}</p>
          <form onSubmit={handleRegistrarMenor} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Nombres del Menor *</label>
              <input required type="text" value={menorData.nombres} onChange={(e) => setMenorData({ ...menorData, nombres: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:border-gray-700 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Apellidos del Menor *</label>
              <input required type="text" value={menorData.apellidos} onChange={(e) => setMenorData({ ...menorData, apellidos: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:border-gray-700 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Fecha de Nacimiento *</label>
              <input required type="date" min="1900-01-01" max={new Date().toISOString().split("T")[0]} value={menorData.fecha_nacimiento} onChange={(e) => setMenorData({ ...menorData, fecha_nacimiento: e.target.value })} className="show-date-picker w-full border rounded-lg px-3 py-2 dark:border-gray-700 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Cédula {menorData.fecha_nacimiento && ageMenor >= 9 ? "*" : "(Opcional si es < 9 años)"}</label>
              <input 
                type="text" 
                value={menorData.cedula} 
                onChange={(e) => setMenorData({ ...menorData, cedula: e.target.value })} 
                onKeyDown={limitNumericInput}
                className="w-full border rounded-lg px-3 py-2 dark:border-gray-700 dark:bg-gray-700 dark:text-white" 
                placeholder="Ej. 12345678" 
                required={!!menorData.fecha_nacimiento && ageMenor >= 9}
              />
            </div>
            {menorData.fecha_nacimiento && ageMenor >= 9 && ageMenor <= 13 && (
              <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                <span>⚠️</span> Este menor tiene {ageMenor} años. Se recomienda tramitar su cédula de identidad pronto.
              </div>
            )}
            {menorData.fecha_nacimiento && ageMenor >= 12 && (
              <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                <span>🚫</span> No se puede registrar como menor. A partir de 12 años debe registrarse como visitante regular.
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!!menorData.fecha_nacimiento && ageMenor >= 12}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >Guardar e Ingresar</button>
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

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 mb-6">
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

      {/* Modal de Asistencia Personal (Empleados) */}
      <AsistenciaModal 
        isOpen={isAsistenciaModalOpen} 
        onClose={() => setIsAsistenciaModalOpen(false)} 
      />

    </div>
  );
}
