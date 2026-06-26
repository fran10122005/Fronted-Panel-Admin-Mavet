import React, { useState, useEffect } from "react";
import { Link } from "react-router"; // Fixed import from 'react-router' as seen in App.tsx
import { mavetApi } from "../../services/api";
import { AsistenciaPayload } from "../../types";
import { limitNumericInput } from "../../utils/validation";

type TipoMovimiento = AsistenciaPayload["tipoMovimiento"];

export default function Asistencia() {
  const [cedula, setCedula] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeButton, setActiveButton] = useState<TipoMovimiento | null>(null);
  
  // Estado para la alerta
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ 
    show: false, 
    message: "", 
    type: "success" 
  });

  // Reloj en tiempo real para el Kiosko
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  const handleRegistro = async (tipoMovimiento: TipoMovimiento) => {
    if (!cedula.trim()) {
      showAlert("Por favor, ingrese su número de cédula.", "error");
      return;
    }

    setIsSubmitting(true);
    setActiveButton(tipoMovimiento);

    try {
      const payload: AsistenciaPayload = {
        cedulaTrabajador: cedula,
        tipoMovimiento: tipoMovimiento,
        timestamp: new Date().toISOString()
      };

      const response = await mavetApi.registrarAsistencia(payload);
      showAlert(response.message, "success");
      setCedula(""); // Limpiar input automáticamente tras éxito
    } catch (error: any) {
      showAlert(error.message || "Error al registrar la asistencia.", "error");
    } finally {
      setIsSubmitting(false);
      setActiveButton(null);
    }
  };

  const formattedTime = time.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const formattedDate = time.toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Patrón de fondo (decorativo) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PHBhdGggZD0iTTM2IDM0djIyaDIydjIySDBWMGg2MHYzNGgtMjR6bTI0IDI2SDM0di0yMmgyMnYyMnpNMCAwdjIyaDIyVjBIMHptMCAzNHYyMmgyMlYzNEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

      {/* Floating Alert */}
      {alertInfo.show && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border-2 shadow-2xl ${
            alertInfo.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-900' 
              : 'bg-red-50 border-red-500 text-red-900'
          }`}>
            <span className="text-3xl">
              {alertInfo.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="font-bold text-lg">
              {alertInfo.message}
            </span>
          </div>
        </div>
      )}

      {/* Tarjeta principal del Kiosko */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative z-10">
        
        {/* Cabecera / Reloj */}
        <div className="bg-brand-500 text-white p-8 text-center relative">
          <Link to="/" className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors" title="Volver al Panel">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Control de Asistencia</h1>
          <p className="text-brand-100 font-medium text-lg uppercase tracking-widest mb-6">Museo MAVET</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl py-2 inline-block px-12 border border-white/20">
            <div className="text-5xl font-mono font-black tabular-nums tracking-tighter">{formattedTime}</div>
            <div className="text-sm font-medium mt-1 text-brand-100 capitalize">{formattedDate}</div>
          </div>
        </div>

        {/* Cuerpo / Formulario */}
        <div className="p-10 space-y-10">
          
          {/* Input de Cédula */}
          <div className="max-w-md mx-auto">
            <label className="block text-center text-gray-700 font-bold mb-3 text-lg">Ingrese su Número de Cédula</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <input
                type="text"
                autoFocus
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onKeyDown={limitNumericInput}
                disabled={isSubmitting}
                className="block w-full pl-12 pr-4 py-2 text-center text-2xl font-bold text-gray-900 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500 outline-none placeholder:text-gray-300 placeholder:font-normal"
                placeholder="Ej. V-12345678"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Grilla de 2 Botones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={() => handleRegistro("Entrada Mañana")}
              disabled={isSubmitting}
              className={`relative group flex flex-col items-center justify-center p-6 border-2 border-green-500 bg-green-50 rounded-2xl transition-all ${
                isSubmitting && activeButton !== "Entrada Mañana" ? "opacity-50 cursor-not-allowed grayscale" : "hover:bg-green-500 hover:text-white shadow-sm hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {isSubmitting && activeButton === "Entrada Mañana" ? (
                <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-green-600 group-hover:text-white mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                  <span className="font-bold text-green-800 group-hover:text-white text-lg">Entrada</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleRegistro("Salida Tarde")}
              disabled={isSubmitting}
              className={`relative group flex flex-col items-center justify-center p-6 border-2 border-red-500 bg-red-50 rounded-2xl transition-all ${
                isSubmitting && activeButton !== "Salida Tarde" ? "opacity-50 cursor-not-allowed grayscale" : "hover:bg-red-500 hover:text-white shadow-sm hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {isSubmitting && activeButton === "Salida Tarde" ? (
                <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-red-600 group-hover:text-white mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  <span className="font-bold text-red-800 group-hover:text-white text-lg">Salida</span>
                </>
              )}
            </button>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
          <p className="text-gray-400 text-sm font-medium">MAVET - Sistema de Control de Personal Autorizado</p>
        </div>
      </div>
    </div>
  );
}
