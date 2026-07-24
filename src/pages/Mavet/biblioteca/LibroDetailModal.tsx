import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Badge from "../../../components/ui/Badge";
import QRCodeGenerator from "../../../components/ui/QRCodeGenerator";
import { Libro } from "../../../types";

interface Props {
  libro: Libro | null;
  onClose: () => void;
  onEdit: (l: Libro) => void;
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

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try { return dateStr.substring(0, 10); } catch { return dateStr; }
}

const estadoScheme: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  Aprobado: "success",
  Pendiente: "warning",
  Rechazado: "danger",
};

export default function LibroDetailModal({ libro, onClose, onEdit }: Props) {
  const l = libro;
  return (
    <Modal isOpen={l !== null} onClose={onClose} showCloseButton={false} className="max-w-2xl p-0 overflow-hidden">
      {l && (
        <div className="flex flex-col">
          <div className="relative bg-gradient-to-br from-brand-900 via-brand-950 to-brand-950 px-6 pt-6 pb-16">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '16px 16px'
            }} />
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg transition-colors z-10" title="Cerrar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="relative z-[1]">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{l.titulo}</h2>
              <p className="text-sm text-white/70 font-medium mt-0.5">{l.autor}</p>
              <div className="flex items-center gap-2 mt-3">
                {l.categoria && <Badge scheme="neutral" className="text-white/80 border-white/20 bg-white/10">{l.categoria}</Badge>}
                <Badge scheme={estadoScheme[l.estado] || "neutral"} dot pulse>
                  {l.estado}
                </Badge>
              </div>
            </div>
          </div>

          <div className="px-6 -mt-8 relative z-[2]">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  label="Código de Unidad" value={l.unidad || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                  label="Nº Catalogación" value={l.cuota || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                  label="Estante" value={l.estante || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                  label="Categoría" value={l.categoria || "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  label="Año de Publicación" value={l.ano_libro ? String(l.ano_libro).substring(0, 4) : "—"}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  label="Fecha de Registro" value={formatDate(l.fecha_ingreso)}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                  label="Disponibilidad"
                  value={
                    <Badge scheme={l.cantidad_disponible <= 0 ? "danger" : "success"}>
                      {l.cantidad_disponible} de {l.cantidad_total} ejemplares
                    </Badge>
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-5">
            <QRCodeGenerator 
              url={`${window.location.origin}/biblioteca?id=${l.id}`}
              filename={`qr-libro-${l.unidad || l.id}`}
              variant="button"
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
            <Button size="sm" onClick={() => { onEdit(l); onClose(); }}
              startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}>
              Editar Libro
            </Button>
          </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
