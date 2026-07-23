import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal, FormSection } from "../../../components/ui/form";
import { inputClsWithIcon, iconWrapperCls, inputWithError, selectCls, labelCls } from "../../../utils/formClasses";
import { User, Calendar, Phone, FileText, Book } from "lucide-react";
import { limitNumericInput } from "../../../utils/validation";

const inscripcionSchema = z.object({
  tallerId: z.string().min(1, "Debe seleccionar un taller"),
  alumnoCedula: z.string().min(1, "La cédula del alumno es obligatoria"),
  alumnoNombre: z.string().min(1, "El nombre del alumno es obligatorio"),
  alumnoEdad: z.string().min(1, "La edad del alumno es obligatoria"),
  repNombre: z.string().optional(),
  repCedula: z.string().optional(),
  repTelefono: z.string().optional(),
  correo: z.string().optional(),
}).superRefine((data, ctx) => {
  const edad = parseInt(data.alumnoEdad, 10);
  if (!isNaN(edad) && edad < 18) {
    if (!data.repNombre?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los menores requieren nombre del representante", path: ["repNombre"] });
    }
    if (!data.repCedula?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los menores requieren cédula del representante", path: ["repCedula"] });
    }
  }
});

export type InscripcionFormValues = z.infer<typeof inscripcionSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  talleres: any[];
  selectedTallerEnroll: any;
  isSubmitting: boolean;
  formError: string;
  onSubmit: (data: InscripcionFormValues) => void;
  onDismissError?: () => void;
}

export default function InscripcionModal({
  isOpen, onClose, talleres, selectedTallerEnroll,
  isSubmitting, formError, onSubmit, onDismissError,
}: Props) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<InscripcionFormValues>({
    resolver: zodResolver(inscripcionSchema),
    defaultValues: { tallerId: "", alumnoCedula: "", alumnoNombre: "", alumnoEdad: "", repNombre: "", repCedula: "", repTelefono: "", correo: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ tallerId: selectedTallerEnroll?.id_taller || "", alumnoCedula: "", alumnoNombre: "", alumnoEdad: "", repNombre: "", repCedula: "", repTelefono: "", correo: "" });
    }
  }, [isOpen, selectedTallerEnroll, reset]);

  const alumnoEdad = watch("alumnoEdad");
  const edadNum = parseInt(alumnoEdad, 10);
  const esMenor = !isNaN(edadNum) && edadNum < 18;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Inscribir Alumno"
      subtitle={`Taller: ${selectedTallerEnroll?.nombre_curso || ""}`}
      formError={formError}
      onDismissError={onDismissError}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabelNew="Inscribir Alumno"
      maxWidth="max-w-2xl"
    >
      <FormSection icon={<FileText className="w-3.5 h-3.5" />} title="Taller">
        <div>
          <label className={labelCls}>Seleccionar Taller</label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <Book className="w-4 h-4 text-gray-400" />
            </div>
            <select className={`${selectCls} pl-10 ${errors.tallerId ? "border-red-500" : ""}`}
              {...register("tallerId")}>
              {talleres.map((t: any) => (
                <option key={t.id_taller} value={t.id_taller}>{t.nombre_curso}</option>
              ))}
            </select>
            {errors.tallerId && <p className="text-red-500 text-xs mt-1">{errors.tallerId.message}</p>}
          </div>
        </div>
      </FormSection>

      <FormSection icon={<User className="w-3.5 h-3.5" />} title="Datos del Alumno">
        <div>
          <label className={labelCls}>Cédula <span className="text-red-400">*</span></label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.5.835 2.5 1.875M11 17.25c0-1.04.894-1.875 2-1.875" /></svg>
            </div>
            <input type="text" placeholder="V-12345678"
              className={inputWithError(inputClsWithIcon, !!errors.alumnoCedula)}
              {...register("alumnoCedula")} />
            {errors.alumnoCedula && <p className="text-red-500 text-xs mt-1">{errors.alumnoCedula.message}</p>}
          </div>
        </div>
        <div>
          <label className={labelCls}>Nombre Completo <span className="text-red-400">*</span></label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Ej. Carlos Mendoza"
              className={inputWithError(inputClsWithIcon, !!errors.alumnoNombre)}
              {...register("alumnoNombre")} />
            {errors.alumnoNombre && <p className="text-red-500 text-xs mt-1">{errors.alumnoNombre.message}</p>}
          </div>
        </div>
        <div>
          <label className={labelCls}>Edad <span className="text-red-400">*</span></label>
          <div className="relative">
            <div className={iconWrapperCls}>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <input type="number" placeholder="Edad"
              onKeyDown={limitNumericInput}
              className={inputWithError(inputClsWithIcon, !!errors.alumnoEdad)}
              {...register("alumnoEdad")} />
            {errors.alumnoEdad && <p className="text-red-500 text-xs mt-1">{errors.alumnoEdad.message}</p>}
          </div>
          {alumnoEdad && !esMenor && (
            <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Mayor de edad — no requiere representante.
            </p>
          )}
          {esMenor && (
            <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Menor de edad — se requieren datos del representante.
            </p>
          )}
        </div>
      </FormSection>

      {esMenor && (
        <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-xl p-4 space-y-4 border border-amber-200 dark:border-amber-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            Datos del Representante
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Nombre Completo</label>
              <div className="relative">
                <div className={iconWrapperCls}>
                  <User className="w-4 h-4 text-amber-400" />
                </div>
                <input type="text" placeholder="Ej. Ana Mendoza"
                  className={inputWithError(inputClsWithIcon, !!errors.repNombre)}
                  {...register("repNombre")} />
                {errors.repNombre && <p className="text-red-500 text-xs mt-1">{errors.repNombre.message}</p>}
              </div>
            </div>
            <div>
              <label className={labelCls}>Cédula</label>
              <div className="relative">
                <div className={iconWrapperCls}>
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.5.835 2.5 1.875M11 17.25c0-1.04.894-1.875 2-1.875" /></svg>
                </div>
                <input type="text" placeholder="V-12345678"
                  className={inputWithError(inputClsWithIcon, !!errors.repCedula)}
                  {...register("repCedula")} />
                {errors.repCedula && <p className="text-red-500 text-xs mt-1">{errors.repCedula.message}</p>}
              </div>
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <div className="relative">
                <div className={iconWrapperCls}>
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <input type="text" placeholder="0414-1234567"
                  onKeyDown={limitNumericInput}
                  className={inputWithError(inputClsWithIcon, !!errors.repTelefono)}
                  {...register("repTelefono")} />
              </div>
            </div>
          </div>
        </div>
      )}
    </FormModal>
  );
}
