import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { mavetApi } from "../../../services/api";
import { normalizeCedula } from "../../../utils/formatters";
import { Search, AlertCircle } from "lucide-react";

const consultanteSchema = z.object({
  cedula: z.string().min(1, "La cédula del solicitante es obligatoria"),
  nombre: z.string().min(1, "El nombre del solicitante es obligatorio"),
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

export default function PrestamoFormModal({
  isOpen,
  onClose,
  selectedLibroTitle,
  maxCantidad,
  isSubmitting,
  onSubmit,
  inputCls,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cantidad, setCantidad] = useState(1);
  const [searchStates, setSearchStates] = useState<Record<number, { loading: boolean; found: boolean; error: string }>>({});

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } =
    useForm<PrestamoFormValues>({
      resolver: zodResolver(consultaSchema) as any,
      defaultValues: { consultantes: [] },
    });

  const { fields } = useFieldArray({ control, name: "consultantes" });

  const handleSearchPersona = async (index: number, cedula: string) => {
    if (!cedula.trim()) return;
    setSearchStates((prev) => ({ ...prev, [index]: { loading: true, found: false, error: "" } }));
    try {
      const results = await mavetApi.buscarPersona(normalizeCedula(cedula));
      if (results.length === 0) {
        setSearchStates((prev) => ({ ...prev, [index]: { loading: false, found: false, error: "No se encontró ninguna persona" } }));
      } else {
        const p = results[0];
        const nombreCompleto = [p.nombres, p.apellidos].filter(Boolean).join(" ");
        setValue(`consultantes.${index}.nombre`, nombreCompleto);
        setSearchStates((prev) => ({ ...prev, [index]: { loading: false, found: true, error: "" } }));
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
    const arr = Array.from({ length: n }, () => ({ cedula: "", nombre: "" }));
    reset({ consultantes: arr });
    setStep(2);
  };

  const handleFinalSubmit = (data: PrestamoFormValues) => {
    onSubmit(data.consultantes);
  };

  const labelCls = "block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300";
  const errorCls = "text-red-500 text-xs mt-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <div className="dark:bg-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Registrar Consulta
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Libro:{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {selectedLibroTitle}
          </span>
          {" "}— Disponibles:{" "}
          <span className="font-semibold text-brand-600">{maxCantidad}</span>
        </p>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                ¿Cuántos ejemplares consultar?
              </label>
              <select
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className={inputCls}
              >
                {Array.from({ length: maxCantidad }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} ejemplar{n > 1 ? "es" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition dark:text-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleContinuar}
                className="px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition"
              >
                Continuar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
              >
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">
                  Consultante #{index + 1}
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Cédula</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={isSubmitting}
                        className={`${inputCls} flex-1 ${errors.consultantes?.[index]?.cedula ? "border-red-500" : ""} disabled:opacity-50`}
                        placeholder="V-12345678"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            handleSearchPersona(index, val);
                          }
                        }}
                        {...register(`consultantes.${index}.cedula`)}
                      />
                      <button
                        type="button"
                        disabled={isSubmitting || searchStates[index]?.loading}
                        onClick={() => {
                          const el = document.querySelector<HTMLInputElement>(`input[name="consultantes.${index}.cedula"]`);
                          handleSearchPersona(index, el?.value || "");
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-50 shrink-0"
                      >
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
                      <p className={errorCls}>{errors.consultantes[index]!.cedula!.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Nombre del Solicitante</label>
                    <input
                      type="text"
                      disabled={isSubmitting || searchStates[index]?.found}
                      className={`${inputCls} ${errors.consultantes?.[index]?.nombre ? "border-red-500" : ""} disabled:opacity-50 ${searchStates[index]?.found ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" : ""}`}
                      placeholder="Ej. María López"
                      {...register(`consultantes.${index}.nombre`)}
                    />
                    {errors.consultantes?.[index]?.nombre && (
                      <p className={errorCls}>{errors.consultantes[index]!.nombre!.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between gap-3 pt-5 border-t border-gray-100 dark:border-gray-700 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Atrás
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 dark:text-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center min-w-[160px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    `Registrar ${cantidad > 1 ? `${cantidad} Consultas` : "Consulta"}`
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
