import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Badge from "../../../components/ui/Badge";
import QRCodeGenerator from "../../../components/ui/QRCodeGenerator";
import { Obra } from "../../../types";

interface Props {
  obra: Obra | null;
  onClose: () => void;
  onEdit: (o: Obra) => void;
  onHistorial: (o: Obra) => void;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
      <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</div>
      </div>
    </div>
  );
}

const estadoScheme: Record<string, "success" | "info" | "warning" | "danger" | "neutral"> = {
  Excelente: "success",
  Bueno: "info",
  Regular: "warning",
  Deteriorado: "danger",
};

export default function ObraDetailModal({ obra, onClose, onEdit, onHistorial }: Props) {
  const o = obra;
  return (
    <Modal isOpen={o !== null} onClose={onClose} showCloseButton={false} className="max-w-2xl p-0 overflow-hidden">
      {o && (
        <div className="flex flex-col">
          <div className="relative bg-gradient-to-br from-brand-900 via-brand-950 to-brand-950 px-6 pt-6 pb-16">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '16px 16px'
            }} />
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg transition-colors z-10" title="Cerrar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="relative z-[1] flex gap-5">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{o.titulo}</h2>
                <p className="text-sm text-white/70 font-medium mt-0.5">{o.autor}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge scheme="neutral" className="text-white/80 border-white/20 bg-white/10">{o.categoria}</Badge>
                  <Badge scheme={estadoScheme[o.estado] || "neutral"} dot pulse>
                    {o.estado}
                  </Badge>
                  {o.clasificacion_patrimonial && o.clasificacion_patrimonial !== "no_clasificado" && (
                    <Badge scheme="warning">{o.clasificacion_patrimonial === "BIC" ? "BIC" : o.clasificacion_patrimonial}</Badge>
                  )}
                </div>
              </div>
              {o.imagen_url && (
                <div className="shrink-0">
                  <img
                    src={o.imagen_url}
                    alt={o.titulo}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover ring-2 ring-white/20 shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-6 -mt-8 relative z-[2]">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                  label="Técnica" value={o.tecnica || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>}
                  label="Medidas" value={o.medidas || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
                  label="Peso" value={o.peso ? `${o.peso} kg` : "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  label="Año de Creación" value={o.ano || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                  label="Piezas" value={o.piezas ?? "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  label="Ubicación" value={o.ubicacion || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  label="Tipo de Ingreso" value={o.tipo_ingreso || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  label="Código de Inventario" value={o.codigo_inventario || "—"}
                />
              </div>

              {o.descripcion && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Descripción</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{o.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-5">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => onHistorial(o)}
                startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                Historial
              </Button>
              <QRCodeGenerator 
                url={`${window.location.origin}/inventario-obras?id=${o.id}`}
                filename={`qr-obra-${o.codigo_inventario || o.id}`}
                variant="button"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
              <Button size="sm" onClick={() => { onEdit(o); onClose(); }}
                startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}>
                Editar Obra
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
