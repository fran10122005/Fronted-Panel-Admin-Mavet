import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { mavetApi } from "../../../services/api";
import { normalizeCedula } from "../../../utils/formatters";
import { Search, AlertCircle, ArrowRight, ArrowLeft, Book, User, Save, X } from "lucide-react";
import toast from "react-hot-toast";

const consultanteSchema = z.object({
  cedula: z.string().min(1, "La cédula del solicitante es obligatoria"),
  nombre: z.string().optional(),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  telefono: z.string().optional(),
  fechaNac: z.string().optional(),
  isNew: z.boolean().optional().default(false),
}).refine((data) => {
  if (data.isNew) {
    return !!data.nombres?.trim() && !!data.apellidos?.trim();
  }
  return !!data.nombre?.trim();
}, {
  message: "Nombre y apellido son obligatorios",
  path: ["nombre"],
});

const consultaSchema = z.object({
  consultantes: z.array(consultanteSchema).min(1, "Debe haber al menos un consultante"),
});

export type PrestamoFormValues = z.infer<typeof consultaSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedLibroTitle: string;
  maxCantidad: number;
  isSubmitting: boolean;
  onSubmit: (consultantes: { cedula: string; nombre: string }[]) => void;
  inputCls: string;
}
import { inputCls as baseInputCls, selectCls as baseSelectCls, modalCls } from "../../../../utils/formClasses";;

export default function PrestamoFormModal({
  isOpen, onClose, selectedLibroTitle, maxCantidad, isSubmitting: parentSubmitting, onSubmit, inputCls,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cantidad, setCantidad] = useState(1);
  const [searchStates, setSearchStates] = useState<Record<number, { loading: boolean; found: boolean; error: string }>>({});
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [motivos, setMotivos] = useState<any[]>([]);

  useEffect(() => {
    mavetApi.obtenerMotivos().then(setMotivos).catch(() => {});
  }, []);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } =
    useForm<PrestamoFormValues>({
      resolver: zodResolver(consultaSchema) as any,
      defaultValues: { consultantes: [] },
    });

  const { fields } = useFieldArray({ control, name: "consultantes" });

  const watchConsultantes = watch("consultantes");

  const handleSearchPersona = async (index: number, cedula: string) => {
    if (!cedula.trim()) return;
    setSearchStates((prev) => ({ ...prev, [index]: { loading: true, found: false, error: "" } }));
    try {
      const results = await mavetApi.buscarPersona(normalizeCedula(cedula));
      if (results.length === 0) {
        setSearchStates((prev) => ({ ...prev, [index]: { loading: false, found: false, error: "" } }));
        setValue(`consultantes.${index}.isNew`, true);
        setValue(`consultantes.${index}.nombre`, "");
      } else {
        const p = results[0];
        const nombreCompleto = [p.nombres, p.apellidos].filter(Boolean).join(" ");
        setValue(`consultantes.${index}.nombre`, nombreCompleto);
        setValue(`consultantes.${index}.isNew`, false);
        setSearchStates((prev) => ({ ...prev, [index]: { loading: true, found: true, error: "" } }));
        setTimeout(() => setSearchStates((prev) => ({ ...prev, [index]: { loading: false, found: true, error: "" } })), 300);
      }
    } catch {
      setSearchStates((prev) => ({ ...prev, [index]: { loading: false, found: false, error: "Error al buscar la persona" } }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setStep(1);
      setSearchStates({});
      reset({ consultantes: [] });
    }
  }, [isOpen, reset]);

  const handleContinuar = () => {
    const n = Math.max(cantidad, 1);
    if (n > maxCantidad) return;
    const arr = Array.from({ length: n }, () => ({ cedula: "", nombre: "", nombres: "", apellidos: "", telefono: "", fechaNac: "", isNew: false }));
    reset({ consultantes: arr });
    setStep(2);
  };

  const handleFinalSubmit = async (data: PrestamoFormValues) => {
    setLocalSubmitting(true);
    try {
      // Find motive for Biblioteca
      const motivoBib = motivos.find(
        (m: any) => m.nombre?.toLowerCase().includes("biblioteca") || m.descripcion?.toLowerCase().includes("biblioteca") || m.nombre?.toLowerCase().includes("lectura")
      ) || motivos[0];
      const motivoId = motivoBib ? motivoBib.id_motivo : "MVI-00001";

      const finalConsultantes = [];
      for (const c of data.consultantes) {
        if (c.isNew) {
          const regPayload = {
            cedula: normalizeCedula(c.cedula),
            nombres: c.nombres?.trim(),
            apellidos: c.apellidos?.trim(),
            telefono: c.telefono?.trim() || undefined,
            fecha_de_nac: c.fechaNac || undefined,
            id_motivo: motivoId,
            cantidad_acompanantes: 0,
            consentimiento_datos: true,
          };
          await mavetApi.registrarIngreso(regPayload);
          finalConsultantes.push({
            cedula: normalizeCedula(c.cedula),
            nombre: `${c.nombres?.trim()} ${c.apellidos?.trim()}`,
          });
        } else {
          finalConsultantes.push({
            cedula: normalizeCedula(c.cedula),
            nombre: c.nombre || "",
          });
        }
      }
      onSubmit(finalConsultantes);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar personas en Biblioteca");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const isSubmitting = parentSubmitting || localSubmitting;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-0">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registrar Consulta</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Libro: <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedLibroTitle}</span>
              {" — "}
              <span className="font-semibold text-brand-600 dark:text-brand-400">{maxCantidad} disponibles</span>
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 1
              ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 ring-2 ring-brand-500/30"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          }`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
              step === 1 ? "bg-brand-500 text-white" : "bg-gray-300 dark:bg-gray-600 text-white"
            }`}>1</span>
            Cantidad
          </div>
          <div className={`flex-1 h-px ${step === 2 ? "bg-brand-300 dark:bg-brand-700" : "bg-gray-200 dark:bg-gray-700"}`} />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 2
              ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 ring-2 ring-brand-500/30"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          }`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
              step === 2 ? "bg-brand-500 text-white" : "bg-gray-300 dark:bg-gray-600 text-white"
            }`}>2</span>
            Solicitantes
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="p-6 space-y-5">
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Book className="w-3.5 h-3.5" />
              Ejemplares a Consultar
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">Cantidad de Ejemplares</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <Book className="w-4 h-4 text-gray-400" />
                </div>
                <select value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))}
                  className={baseSelectCls + " pl-10"}>
                  {Array.from({ length: maxCantidad }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} ejemplar{n > 1 ? "es" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button type="button" onClick={handleContinuar}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition">
              Continuar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleFinalSubmit)} className="p-6 space-y-5">
          <div className="space-y-3">
            {fields.map((field, index) => {
              const isNew = watchConsultantes[index]?.isNew;
              return (
                <div key={field.id} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">
                    <User className="w-3.5 h-3.5" />
                    Solicitante #{index + 1}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">Cédula</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.5.835 2.5 1.875M11 17.25c0-1.04.894-1.875 2-1.875" /></svg>
                          </div>
                          <input type="text" disabled={isSubmitting}
                            className={`${baseInputCls} pl-10 ${errors.consultantes?.[index]?.cedula ? "border-red-500" : ""} disabled:opacity-50`}
                            placeholder="V-12345678"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); const val = (e.target as HTMLInputElement).value; handleSearchPersona(index, val); }
                            }}
                            {...register(`consultantes.${index}.cedula`)} />
                        </div>
                        <button type="button" disabled={isSubmitting || searchStates[index]?.loading}
                          onClick={() => { const el = document.querySelector<HTMLInputElement>(`input[name="consultantes.${index}.cedula"]`); handleSearchPersona(index, el?.value || ""); }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-50 shrink-0">
                          {searchStates[index]?.loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Buscar</span>
                        </button>
                      </div>
                      {searchStates[index]?.error && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <p className="text-xs font-medium">{searchStates[index].error}</p>
                        </div>
                      )}
                      {errors.consultantes?.[index]?.cedula && (
                        <p className="text-red-500 text-xs mt-1">{errors.consultantes[index]!.cedula!.message}</p>
                      )}
                    </div>

                    {isNew ? (
                      <div className="bg-amber-50/30 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-3.5 space-y-3">
                        <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Persona No Registrada — Ingresar Datos</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1 text-[11px] font-semibold text-gray-500">Nombres *</label>
                            <input type="text" disabled={isSubmitting} className={baseInputCls} placeholder="Ej. Ana"
                              {...register(`consultantes.${index}.nombres`)} />
                          </div>
                          <div>
                            <label className="block mb-1 text-[11px] font-semibold text-gray-500">Apellidos *</label>
                            <input type="text" disabled={isSubmitting} className={baseInputCls} placeholder="Ej. Silva"
                              {...register(`consultantes.${index}.apellidos`)} />
                          </div>
                          <div>
                            <label className="block mb-1 text-[11px] font-semibold text-gray-500">Teléfono (Opcional)</label>
                            <input type="text" disabled={isSubmitting} className={baseInputCls} placeholder="Ej. 04241234567"
                              {...register(`consultantes.${index}.telefono`)} />
                          </div>
                          <div>
                            <label className="block mb-1 text-[11px] font-semibold text-gray-500">Nacimiento (Opcional)</label>
                            <input type="date" disabled={isSubmitting} className="show-date-picker w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white"
                              {...register(`consultantes.${index}.fechaNac`)} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">Nombre del Solicitante</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <input type="text" disabled={isSubmitting || searchStates[index]?.found}
                            className={`${baseInputCls} pl-10 ${errors.consultantes?.[index]?.nombre ? "border-red-500" : ""} disabled:opacity-50 ${searchStates[index]?.found ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" : ""}`}
                            placeholder="Ej. María López"
                            {...register(`consultantes.${index}.nombre`)} />
                        </div>
                        {errors.consultantes?.[index]?.nombre && (
                          <p className="text-red-500 text-xs mt-1">{errors.consultantes[index]!.nombre!.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setStep(1)} disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmitting ? "Guardando..." : `Registrar ${cantidad > 1 ? `${cantidad} Consultas` : "Consulta"}`}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
