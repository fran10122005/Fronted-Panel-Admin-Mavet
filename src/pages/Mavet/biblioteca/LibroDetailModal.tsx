import { Modal } from "../../../components/ui/modal";
import { Libro } from "../../../types";

interface Props {
  libro: Libro | null;
  onClose: () => void;
  onEdit: (libro: Libro) => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return dateStr.substring(0, 10);
  } catch {
    return dateStr;
  }
}

export default function LibroDetailModal({ libro, onClose, onEdit }: Props) {
  const l = libro;
  return (
    <Modal
      isOpen={l !== null}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-3xl p-0 overflow-hidden"
    >
      {l && (
        <div className="flex flex-col md:flex-row min-h-[420px]">
          <div
            className="md:w-[280px] w-full bg-brand-950 p-5 flex flex-col items-center justify-between relative text-white"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), 
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            <div className="w-full flex justify-between text-[11px] font-semibold tracking-wider text-brand-300">
              <span>{l.unidad || l.id}</span>
              <span>BIBLIOTECA</span>
            </div>

            <div className="w-44 h-56 my-6 border border-brand-800/60 bg-brand-950/40 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center relative p-4 group overflow-hidden">
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-brand-400"></div>
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-brand-400"></div>
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-brand-400"></div>
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-brand-400"></div>

              <div className="flex flex-col items-center justify-center">
                <svg className="w-10 h-10 text-brand-400/80 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-semibold text-[11px] tracking-wider text-brand-100 uppercase text-center">Ficha de Libro</span>
                <span className="text-[9px] text-brand-300/60 tracking-widest uppercase mt-1 text-center font-serif">Colección MAVET</span>
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
                    {l.titulo}
                  </h2>
                  <p className="text-brand-500 dark:text-brand-400 font-semibold text-xs mt-1">
                    • {l.autor}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado del Ejemplar</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Estatus de Catálogo</span>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  l.estado === 'Aprobado' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' :
                  l.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/40' :
                  'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {l.estado}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Código de Unidad</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{l.unidad || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nº Catalogación (Cuota)</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{l.cuota || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ubicación Física (Estante)</span>
                    <span className="text-xs font-semibold text-gray-855 dark:text-gray-200">{l.estante || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categoría</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{l.categoria || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Año de Publicación</span>
                    <span className="text-xs font-semibold text-gray-855 dark:text-gray-205">{l.ano_libro ? String(l.ano_libro).substring(0, 4) : '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha de Registro</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{formatDate(l.fecha_ingreso)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cantidad y Disponibilidad en Sala</span>
                    <div className="mt-1">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        l.cantidad_disponible <= 0
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400'
                          : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400'
                      }`}>
                        {l.cantidad_disponible} disponibles de {l.cantidad_total} ejemplares
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => { onEdit(l); onClose(); }}
                className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar Libro
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
