import { Modal } from "../../../components/ui/modal";
import { Trabajador } from "../../../types";

interface Props {
  trabajador: Trabajador | null;
  onClose: () => void;
  onEdit: (t: Trabajador) => void;
}

export default function TrabajadorDetailModal({ trabajador: t, onClose, onEdit }: Props) {
  return (
    <Modal
      isOpen={t !== null}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-3xl p-0 overflow-hidden"
    >
      {t && (
        <div className="flex flex-col md:flex-row min-h-[420px]">
          <div
            className="md:w-[280px] w-full bg-brand-950 p-5 flex flex-col items-center justify-between relative text-white"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), 
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            <div className="w-full flex justify-between text-[11px] font-semibold tracking-wider text-brand-300">
              <span>{t.cedula}</span>
              <span>REGISTRO RRHH</span>
            </div>

            <div className="w-44 h-56 my-6 border border-brand-800/60 bg-brand-950/40 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center relative p-4 group overflow-hidden">
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-brand-400"></div>
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-brand-400"></div>
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-brand-400"></div>
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-brand-400"></div>

              <div className="flex flex-col items-center justify-center">
                <svg className="w-10 h-10 text-brand-400/80 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold text-[11px] tracking-wider text-brand-100 uppercase text-center">Ficha de Personal</span>
                <span className="text-[9px] text-brand-300/60 tracking-widest uppercase mt-1 text-center font-serif">MAVET RRHH</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold tracking-widest text-brand-300">MAVET</p>
              <p className="text-[9px] text-brand-400/60 mt-0.5">Museo de Artes Visuales y del Espacio</p>
            </div>
          </div>

          <div className="flex-1 p-6 bg-[#fcfafa] dark:bg-gray-900 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                    {t.nombre} {t.apellido}
                  </h2>
                  <p className="text-brand-500 dark:text-brand-400 font-semibold text-xs mt-1">
                    • {t.cargo}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Cerrar"
                >
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm my-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016a11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado Laboral</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Condición Actual</span>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  t.estado === 'Activo' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' :
                  'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {t.estado}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.378 0 2.483.964 2.483 2.15H5C5 16.114 6.105 15.15 7.483 15.15z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cédula</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.cedula}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cargo</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.cargo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Teléfono de Contacto</span>
                    <span className="text-xs font-semibold text-gray-855 dark:text-gray-200">{t.telefono || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Correo Electrónico</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.correo || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Horas Semanales Requeridas</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.horas_semanales || '0'} horas</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estatus Laboral</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.estado}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-gray-655 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => { onEdit(t); onClose(); }}
                className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar Trabajador
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
