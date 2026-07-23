import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal, FormSection } from "../../../components/ui/form";
import { inputClsWithIcon, iconWrapperCls, inputWithError } from "../../../utils/formClasses";
import { Book, MessageSquare } from "lucide-react";

const tallerInventarioSchema = z.object({
  nombre: z.string().min(1, "El nombre del taller es obligatorio"),
  descripcion: z.string().optional(),
});

export type TallerInventarioFormValues = z.infer<typeof tallerInventarioSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  initialData?: { nombre: string; descripcion: string };
  isSubmitting: boolean;
  formError: string;
  onSubmit: (data: TallerInventarioFormValues) => void;
  onDismissError?: () => void;
}

export default function TallerFormModal({
  isOpen, onClose, isEditing, initialData,
  isSubmitting, formError, onSubmit, onDismissError,
}: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TallerInventarioFormValues>({
    resolver: zodResolver(tallerInventarioSchema),
    defaultValues: initialData || { nombre: "", descripcion: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { nombre: "", descripcion: "" });
    }
  }, [isOpen, initialData, reset]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Taller" : "Crear Taller"}
      subtitle={isEditing ? "Modifique los datos del taller en el inventario." : "Agregue un taller al inventario maestro."}
      formError={formError}
      onDismissError={onDismissError}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      onSubmit={handleSubmit(onSubmit)}
      submitLabelNew="Guardar Taller"
      submitLabelEdit="Actualizar"
    >
      <FormSection icon={<Book className="w-3.5 h-3.5" />} title="Información del Taller">
        <div>
          <label className="block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Nombre del Taller <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <Book className="w-4 h-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Ej. Pintura al Óleo"
              className={inputWithError(inputClsWithIcon, !!errors.nombre)}
              {...register("nombre")} />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
        </div>
        <div>
          <label className="block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Descripción
          </label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <MessageSquare className="w-4 h-4 text-gray-400" />
            </div>
            <textarea rows={3} placeholder="Breve descripción del taller..."
              className={inputWithError(inputClsWithIcon + " resize-none", !!errors.descripcion)}
              {...register("descripcion")} />
          </div>
        </div>
      </FormSection>
    </FormModal>
  );
}
