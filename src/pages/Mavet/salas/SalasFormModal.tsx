import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal, FormSection } from "../../../components/ui/form";
import { inputClsWithIcon, iconWrapperCls, inputWithError, labelCls } from "../../../utils/formClasses";
import { MapPin, Users, FileText, Image } from "lucide-react";
import toast from "react-hot-toast";

const espacioSchema = z.object({
  codigo_espacio: z.string().optional(),
  nombre_espacio: z.string().min(1, "El nombre del espacio es obligatorio"),
  capacidad_maxima: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(1, "La capacidad debe ser al menos 1 persona").max(80, "La capacidad máxima permitida es de 80 personas").optional()
  ),
  descripcion: z.string().optional(),
});

export type EspacioFormValues = z.infer<typeof espacioSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  initialData?: EspacioFormValues & { imagen_url?: string };
  existingNames: string[];
  editingId: number | null;
  isSubmitting: boolean;
  formError: string;
  onSubmit: (data: EspacioFormValues & { imagenFile?: File | null }) => void;
  onDismissError?: () => void;
}

export default function SalasFormModal({
  isOpen, onClose, isEditing, initialData,
  existingNames, editingId,
  isSubmitting, formError, onSubmit, onDismissError,
}: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EspacioFormValues>({
    resolver: zodResolver(espacioSchema),
    defaultValues: { codigo_espacio: "", nombre_espacio: "", capacidad_maxima: "" as any, descripcion: "" },
  });

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        codigo_espacio: initialData.codigo_espacio || "",
        nombre_espacio: initialData.nombre_espacio || "",
        capacidad_maxima: initialData.capacidad_maxima?.toString() as any || "" as any,
        descripcion: initialData.descripcion || "",
      });
    }
  }, [isOpen, initialData, reset]);

  const cleanImagePreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImagenFile(null);
    setImagenPreviewUrl(null);
  };

  const handleFormSubmit = (data: EspacioFormValues) => {
    const trimmedName = data.nombre_espacio.trim();
    const isDuplicate = existingNames.some(name =>
      name.toLowerCase() === trimmedName.toLowerCase() &&
      !isEditing
    );
    if (isDuplicate) {
      toast.error("Ya existe un espacio con ese nombre");
      return;
    }
    onSubmit({ ...data, imagenFile });
    cleanImagePreview();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={() => { onClose(); cleanImagePreview(); }}
      title={isEditing ? "Editar Espacio" : "Nuevo Espacio"}
      subtitle={isEditing ? "Modifique los datos del espacio." : "Agregue un nuevo espacio al museo."}
      formError={formError}
      onDismissError={onDismissError}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabelNew="Crear Espacio"
      submitLabelEdit="Actualizar Espacio"
    >
      <FormSection icon={<MapPin className="w-3.5 h-3.5" />} title="Información del Espacio">
        <div>
          <label className={labelCls}>Código de Espacio</label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <input type="text" readOnly tabIndex={-1}
              className={inputClsWithIcon + " bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-70"}
              {...register("codigo_espacio")} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Nombre del Espacio <span className="text-red-400">*</span></label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Ej. Sala 1, Auditorio..."
              className={inputWithError(inputClsWithIcon, !!errors.nombre_espacio)}
              {...register("nombre_espacio")} />
            {errors.nombre_espacio && <p className="text-red-500 text-xs mt-1">{errors.nombre_espacio.message}</p>}
          </div>
        </div>
      </FormSection>

      <FormSection icon={<Users className="w-3.5 h-3.5" />} title="Capacidad">
        <div>
          <label className={labelCls}>Capacidad Máxima</label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <input type="number" min={1} max={80} placeholder="Ej. 50 (máx. 80)"
              className={inputWithError(inputClsWithIcon, !!errors.capacidad_maxima)}
              {...register("capacidad_maxima")} />
            {errors.capacidad_maxima && <p className="text-red-500 text-xs mt-1">{errors.capacidad_maxima.message}</p>}
          </div>
        </div>
      </FormSection>

      <FormSection icon={<FileText className="w-3.5 h-3.5" />} title="Descripción e Imagen">
        <div>
          <label className={labelCls}>Descripción</label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <textarea rows={3} placeholder="Detalles sobre el espacio..."
              className={inputWithError(inputClsWithIcon + " resize-none", !!errors.descripcion)}
              {...register("descripcion")} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Imagen del Espacio</label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <Image className="w-4 h-4 text-gray-400" />
            </div>
            <input type="file" accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImagenFile(file);
                if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                const url = file ? URL.createObjectURL(file) : null;
                previewUrlRef.current = url;
                setImagenPreviewUrl(url);
              }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 pl-10" />
          </div>
          {imagenPreviewUrl && (
            <div className="mt-3 w-full max-w-xs h-44 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
              <img src={imagenPreviewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
            </div>
          )}
          {!imagenPreviewUrl && initialData?.imagen_url && (
            <div className="mt-3 w-full max-w-xs h-44 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
              <img src={initialData.imagen_url} alt="Imagen actual" className="w-full h-full object-contain p-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>
      </FormSection>
    </FormModal>
  );
}
