import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { limitNumericInput } from "../../../utils/validation";
import { AlertCircle, Check, Upload, ArrowRight, ArrowLeft, Save, X, Calendar, Clock, Users, FileText } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: {
    id_taller_inventario: string;
    selectedInstructorId: string;
    id_espacio: string;
    sesiones: string;
    fecha: string;
    fecha_fin: string;
    hora_inicio: string;
    hora_fin: string;
    horas_totales: number | string;
    cupo_minimo: number | string;
    cupo_maximo: number | string;
    estado: boolean;
    documentoPlan: File | null;
  };
  inventario: any[];
  instructores: any[];
  espacios: any[];
  isSubmitting: boolean;
  formError: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onEstadoChange: (value: boolean) => void;
  onDocumentoPlanChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
  selectCls: string;
}

const labelCls = "block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300";
const baseInputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all";
const baseSelectCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10";

export default function TallerDetailModal({
  isOpen, onClose, isEditing, formData,
  inventario, instructores, espacios,
  isSubmitting, formError, onChange, onEstadoChange, onDocumentoPlanChange, onSubmit,
  inputCls, selectCls,
}: Props) {
  const [step, setStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  const handleNext = () => {
    if (step === 0) {
      if (!formData.id_taller_inventario) return;
      if (!formData.selectedInstructorId) return;
    }
    setStep(1);
  };

  const handleBack = () => setStep(0);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onDocumentoPlanChange(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onDocumentoPlanChange(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[600px] p-0">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? "Editar Taller Planificado" : "Planificar Taller"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Programe una edición del taller con fecha, instructor y cupos.</p>
          </div>
          <button type="button" onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 0
              ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 ring-2 ring-brand-500/30"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          }`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
              step === 0 ? "bg-brand-500 text-white" : "bg-gray-300 dark:bg-gray-600 text-white"
            }`}>1</span>
            Información
          </div>
          <div className={`flex-1 h-px ${step === 1 ? "bg-brand-300 dark:bg-brand-700" : "bg-gray-200 dark:bg-gray-700"}`} />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 1
              ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 ring-2 ring-brand-500/30"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          }`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
              step === 1 ? "bg-brand-500 text-white" : "bg-gray-300 dark:bg-gray-600 text-white"
            }`}>2</span>
            Programación
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5">
        {step === 0 && (
          <>
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                Información Básica
              </div>
              <div>
                <label className={labelCls}>Taller del Inventario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <select name="id_taller_inventario" value={formData.id_taller_inventario}
                    onChange={onChange} className={baseSelectCls + " pl-10"} required>
                    <option value="">Seleccione un taller del inventario...</option>
                    {inventario.map((i: any) => (
                      <option key={i.id_taller || i.id} value={i.id_taller || i.id}>{i.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Instructor</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <select name="selectedInstructorId" value={formData.selectedInstructorId}
                    onChange={onChange} className={baseSelectCls + " pl-10"} required>
                    <option value="">Seleccione un instructor...</option>
                    {instructores.map((inst: any) => (
                      <option key={inst.id_instructor} value={inst.id_instructor}>
                        {inst.Persona?.nombres || ""} {inst.Persona?.apellidos || ""} {inst.Persona?.cedula ? `(${inst.Persona.cedula})` : ""}
                      </option>
                    ))}
                  </select>
                  {instructores.length === 0 && (
                    <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      No hay instructores registrados. Use "Gestionar Instructores" para agregar uno.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Espacio</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <select name="id_espacio" value={formData.id_espacio}
                      onChange={onChange} className={baseSelectCls + " pl-10"}>
                      <option value="">Seleccione...</option>
                      {espacios.map(e => (
                        <option key={e.id_espacio} value={e.id_espacio}>{e.nombre_espacio || e.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>N° de Sesiones</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </div>
                    <input type="number" name="sesiones" value={formData.sesiones}
                      onChange={onChange} onBlur={(e) => e.target.reportValidity()} onKeyDown={limitNumericInput}
                      className={baseInputCls + " pl-10"} min={1} max={20} placeholder="N° de sesiones" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button type="button" onClick={handleClose} disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button type="button" onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition">
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Fechas y Cupos
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Cupo Mínimo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <input type="number" name="cupo_minimo" value={formData.cupo_minimo}
                      onChange={onChange} onBlur={(e) => e.target.reportValidity()} onKeyDown={limitNumericInput}
                      className={baseInputCls + " pl-10"} min={2} max={30} placeholder="Cupo mín" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Cupo Máximo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <input type="number" name="cupo_maximo" value={formData.cupo_maximo}
                      onChange={onChange} onBlur={(e) => e.target.reportValidity()} onKeyDown={limitNumericInput}
                      className={baseInputCls + " pl-10"} min={2} max={30} placeholder="Cupo máx" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Fecha de Inicio</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <input type="date" name="fecha" value={formData.fecha}
                      min={new Date().toISOString().split("T")[0]}
                      max="9999-12-31"
                      onChange={onChange} onBlur={(e) => e.target.reportValidity()} className={baseInputCls + " pl-10 show-date-picker"} />
                  </div>
                </div>
                {Number(formData.sesiones) > 1 && (
                  <div>
                    <label className={labelCls}>Fecha de Fin</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                      <input type="date" name="fecha_fin" value={formData.fecha_fin}
                        min={formData.fecha || new Date().toISOString().split("T")[0]}
                        max="9999-12-31"
                        onChange={onChange} onBlur={(e) => e.target.reportValidity()} className={baseInputCls + " pl-10 show-date-picker"} />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hora de Inicio</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input type="time" name="hora_inicio" value={formData.hora_inicio}
                      onChange={onChange} onBlur={(e) => e.target.reportValidity()} className={baseInputCls + " pl-10"} min="09:00" max="17:00" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Hora de Fin</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input type="time" name="hora_fin" value={formData.hora_fin}
                      onChange={onChange} onBlur={(e) => e.target.reportValidity()} className={baseInputCls + " pl-10"} min="09:00" max="17:00" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Configuración
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Horas Totales</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <input type="number" name="horas_totales" value={formData.horas_totales}
                      readOnly
                      className={baseInputCls + " pl-10 bg-gray-100 dark:bg-gray-700/50 text-brand-600 dark:text-brand-400 font-semibold cursor-not-allowed"} min={0} placeholder="Horas totales" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <select name="estado" value={formData.estado ? "true" : "false"}
                      onChange={e => onEstadoChange(e.target.value === "true")}
                      className={baseSelectCls + " pl-10"}>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <Upload className="w-3.5 h-3.5" />
                Plan Programático <span className="text-red-400">*</span>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById("documentoPlanInput")?.click()}
                className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  formData.documentoPlan
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-600"
                    : dragOver
                      ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10 dark:border-brand-500 scale-[1.01]"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/30 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                }`}>
                <input id="documentoPlanInput" type="file" accept=".pdf,application/pdf"
                  className="hidden" onChange={handleFileSelect} />
                {formData.documentoPlan ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                      <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate">{formData.documentoPlan.name}</p>
                      <p className="text-xs text-gray-500">{(formData.documentoPlan.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); onDocumentoPlanChange(null); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0" title="Eliminar">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Arrastra o <span className="text-brand-600 dark:text-brand-400 font-semibold">selecciona</span> el PDF
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Solo formato PDF</p>
                  </>
                )}
              </div>
            </div>

            {formError && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{formError}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleBack} disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
                <button type="button" onClick={handleClose} disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmitting ? "Guardando..." : isEditing ? "Guardar Cambios" : "Planificar Taller"}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
