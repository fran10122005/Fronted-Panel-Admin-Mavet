import { useState, useEffect } from 'react';
import { mavetApi } from '../../services/api';

export default function RegistroPublico() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cedula, setCedula] = useState('');
  const [existe, setExiste] = useState(false);
  const [nombreExistente, setNombreExistente] = useState<string | null>(null);

  const [motivos, setMotivos] = useState<any[]>([]);
  const [eventosHoy, setEventosHoy] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    fecha_nacimiento: '',
    id_motivo: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      const [mots, ag] = await Promise.all([
        mavetApi.obtenerMotivosPublicos(),
        mavetApi.getAgendaPublica()
      ]);
      setMotivos(mots);

      const hoyStr = new Date().toISOString().split('T')[0];
      const eventosDeHoy = ag.filter((e: any) => e.fecha?.startsWith(hoyStr));
      setEventosHoy(eventosDeHoy);
    };
    fetchDatos();
  }, []);

  const handleVerificarCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula || cedula.length < 5) {
      setError("Cédula inválida");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await mavetApi.checkVisitantePublico(cedula);
      if (res.existe) {
        setExiste(true);
        setNombreExistente(res.nombre);
      } else {
        setExiste(false);
      }
      setStep(2);
    } catch (err) {
      setError("Error al conectar con el sistema. Intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_motivo) {
      setError("Por favor seleccione el motivo de su visita.");
      return;
    }

    if (!existe && (!formData.nombres || !formData.apellidos)) {
      setError("Por favor complete sus nombres y apellidos.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let finalMotivo = '';
      let finalTaller: string | undefined = undefined;

      if (formData.id_motivo.startsWith('evento_')) {
        finalTaller = formData.id_motivo.split('_')[1];
        const motivoTaller = motivos.find(m => m.descripcion.toLowerCase().includes('taller') || m.descripcion.toLowerCase().includes('educa'));
        finalMotivo = motivoTaller ? motivoTaller.id_motivo : (motivos[0]?.id_motivo || '');
      } else {
        finalMotivo = formData.id_motivo.split('_')[1];
      }

      await mavetApi.registrarAutoIngreso({
        cedula,
        ...formData,
        id_motivo: finalMotivo,
        id_taller: finalTaller
      });
      setStep(3);
    } catch (err: any) {
      setError(err.message || "No se pudo registrar. Acuda a recepción.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-gray-950 dark:from-black dark:via-brand-950 dark:to-gray-950 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('/images/shape/grid-01.svg')] bg-center opacity-[0.04] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-700/20 dark:bg-brand-800/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-800/15 dark:bg-brand-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/10 dark:bg-brand-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-1">
        {/* Card principal */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700/50 rounded-2xl shadow-lg shadow-brand-900/10 dark:shadow-black/40 p-6 md:p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500 ${
                  step >= s
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                }`}>
                  {step > s ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : s}
                </div>
                {s < 3 && (
                  <div className={`w-8 h-0.5 rounded-full transition-all duration-500 ${
                    step > s ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Header con logo */}
          <div className="text-center pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-2xl font-black text-white tracking-tight">M</span>
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Registro de Visitante
            </h2>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              Museo de Artes Visuales y Espacios del Táchira
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-center gap-2.5 bg-error-50 dark:bg-error-950/30 border border-error-200 dark:border-error-800/50 text-error-700 dark:text-error-300 p-3.5 rounded-xl text-sm font-medium shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Cédula */}
          {step === 1 && (
            <form onSubmit={handleVerificarCedula} className="mt-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Identifícate</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ingresa tu cédula para comenzar el registro
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 dark:text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                </div>
                <input
                  id="cedula"
                  name="cedula"
                  type="text"
                  required
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl pl-11 pr-4 py-3.5 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-base shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                  placeholder="Escribe tu cédula aquí"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white px-5 py-3 text-base font-bold shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Buscando...
                  </>
                ) : (
                  <>
                    Siguiente
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Formulario */}
          {step === 2 && (
            <form onSubmit={handleRegistrar} className="mt-6 animate-fade-in">
              {/* Greeting */}
              <div className="flex items-start gap-4 pb-5 mb-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-50 dark:bg-brand-500/15 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-brand-600 dark:text-brand-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  {existe ? (
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">¡Hola de nuevo, {nombreExistente}!</h3>
                  ) : (
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">¡Bienvenido al Museo!</h3>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Completa los datos para registrar tu entrada.</p>
                </div>
              </div>

              {/* New visitor fields */}
              {!existe && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nombres *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.nombres}
                          onChange={e => setFormData({ ...formData, nombres: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg pl-9 pr-3 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 text-sm shadow-sm placeholder:text-gray-400"
                          placeholder="Nombres"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Apellidos *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.apellidos}
                          onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg pl-9 pr-3 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 text-sm shadow-sm placeholder:text-gray-400"
                          placeholder="Apellidos"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Teléfono</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg pl-9 pr-3 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 text-sm shadow-sm placeholder:text-gray-400"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nacimiento</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </div>
                        <input
                          type="date"
                          value={formData.fecha_nacimiento}
                          onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                          className="show-date-picker w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg pl-9 pr-3 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Visit reason badge */}
              <div className="mt-5 p-4 bg-brand-50/50 dark:bg-brand-500/5 rounded-xl border border-brand-100 dark:border-brand-900/30">
                <label className="block text-sm font-bold text-brand-800 dark:text-brand-300 mb-2">
                  ¿Cuál es el motivo de tu visita hoy? *
                </label>
                <select
                  required
                  value={formData.id_motivo}
                  onChange={e => setFormData({ ...formData, id_motivo: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 text-sm shadow-sm"
                >
                  <option value="">Selecciona una opción...</option>
                  {motivos.map(m => (
                    <option key={`m_${m.id_motivo}`} value={`motivo_${m.id_motivo}`}>{m.descripcion}</option>
                  ))}
                  {eventosHoy.length > 0 && (
                    <optgroup label="Eventos y Talleres de Hoy">
                      {eventosHoy.map((e, idx) => (
                        <option key={`e_${idx}`} value={`evento_${e.id.split('-')[1]}`}>
                          {e.titulo} {e.hora_inicio ? `(${e.hora_inicio.substring(0, 5)})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white px-5 py-3 text-base font-bold shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      Registrar mi Entrada
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Volver atrás
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: Éxito */}
          {step === 3 && (
            <div className="mt-6 text-center animate-fade-in-up">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-success-50 dark:bg-success-900/20 ring-4 ring-success-100 dark:ring-success-900/30 mb-5">
                <svg className="h-12 w-12 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">¡Ingreso Registrado!</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Disfruta tu visita en el MAVET. Ya puedes pasar adelante.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    setStep(1);
                    setCedula('');
                    setFormData({ nombres: '', apellidos: '', telefono: '', fecha_nacimiento: '', id_motivo: '' });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 text-white px-6 py-3 text-sm font-bold shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all duration-200 active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                  Registrar a otra persona
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()} MAVET &mdash; Museo de Artes Visuales y Espacios del Táchira
          </p>
        </div>
      </div>
    </div>
  );
}
