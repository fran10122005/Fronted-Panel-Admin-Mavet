import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";

const prestamoSchema = z.object({
  cedula: z.string().min(1, "La cédula del solicitante es obligatoria"),
  nombre: z.string().min(1, "El nombre del solicitante es obligatorio"),
});

export type PrestamoFormValues = z.infer<typeof prestamoSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedLibroTitle: string;
  isSubmitting: boolean;
  onSubmit: (data: PrestamoFormValues) => void;
  inputCls: string;
}

export default function PrestamoFormModal({
  isOpen, onClose, selectedLibroTitle,
  isSubmitting, onSubmit, inputCls,
}: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PrestamoFormValues>({
    resolver: zodResolver(prestamoSchema),
    defaultValues: { cedula: "", nombre: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ cedula: "", nombre: "" });
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Registrar Préstamo</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Libro:{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedLibroTitle}</span>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Cédula del Solicitante
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              className={`${inputCls} ${errors.cedula ? 'border-red-500' : ''} disabled:opacity-50`}
              placeholder="V-12345678"
              {...register("cedula")}
            />
            {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula.message}</p>}
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del Solicitante
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              className={`${inputCls} ${errors.nombre ? 'border-red-500' : ''} disabled:opacity-50`}
              placeholder="Ej. María López"
              {...register("nombre")}
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700 mt-4">
            <button
              type="button" onClick={onClose} disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center justify-center min-w-[150px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Confirmar Préstamo"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
