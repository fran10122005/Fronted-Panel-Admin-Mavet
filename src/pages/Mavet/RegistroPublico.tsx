import React, { useState, useEffect } from 'react';
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
      
      // Filtrar agenda para hoy
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
        // Buscar el motivo que contenga taller o educación, sino usar el primero
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
      setStep(3); // Pantalla de éxito
    } catch (err: any) {
      setError(err.message || "No se pudo registrar. Acuda a recepción.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-brand-700">MAVET</h2>
          <p className="mt-2 text-sm text-gray-600">
            Museo de Artes Visuales y Espacios del Táchira
          </p>
          <div className="mt-4 border-b border-gray-200 w-16 mx-auto"></div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleVerificarCedula} className="space-y-6 animate-fade-in">
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-2">
                Introduce tu Cédula de Identidad
              </label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="appearance-none block w-full px-4 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-lg shadow-sm"
                placeholder="Ej: V-12345678"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-70"
            >
              {isLoading ? "Buscando..." : "Siguiente"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegistrar} className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <span className="text-4xl">👋</span>
              {existe ? (
                <h3 className="text-xl font-bold text-gray-900 mt-2">¡Hola de nuevo, {nombreExistente}!</h3>
              ) : (
                <h3 className="text-xl font-bold text-gray-900 mt-2">¡Bienvenido al Museo!</h3>
              )}
              <p className="text-sm text-gray-500 mt-1">Completa tu registro para entrar.</p>
            </div>

            {!existe && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                  <input type="text" required value={formData.nombres} onChange={e => setFormData({...formData, nombres: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-base" placeholder="Tus nombres" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                  <input type="text" required value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-base" placeholder="Tus apellidos" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm" placeholder="Opcional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nacimiento</label>
                    <input type="date" value={formData.fecha_nacimiento} onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">¿Cuál es el motivo de tu visita hoy? *</label>
              <select 
                required 
                value={formData.id_motivo} 
                onChange={e => setFormData({...formData, id_motivo: e.target.value})} 
                className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-lg text-gray-700"
              >
                <option value="">Selecciona una opción...</option>
                {motivos.map(m => (
                  <option key={`m_${m.id_motivo}`} value={`motivo_${m.id_motivo}`}>{m.descripcion}</option>
                ))}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 mt-6"
            >
              {isLoading ? "Registrando..." : "¡Registrar mi Entrada!"}
            </button>
            
            <div className="text-center mt-4">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-gray-500 hover:text-gray-800">
                Atrás
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
              <svg className="h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">¡Ingreso Registrado!</h2>
            <p className="text-gray-600 text-lg">
              Disfruta tu visita en el MAVET. Ya puedes pasar adelante.
            </p>
            <div className="pt-6">
              <button
                onClick={() => {
                  setStep(1);
                  setCedula('');
                  setFormData({nombres: '', apellidos: '', telefono: '', fecha_nacimiento: '', id_motivo: ''});
                }}
                className="text-brand-600 hover:text-brand-800 font-semibold"
              >
                Registrar a otra persona
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
