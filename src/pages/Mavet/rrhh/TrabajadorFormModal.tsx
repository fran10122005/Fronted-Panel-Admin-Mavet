import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { Cargo } from "../../../types";
import { limitNumericInput } from "../../../utils/validation";

const trabajadorSchema = z.object({
  cedula: z.string().min(1, "La cédula es obligatoria"),
  nombres: z.string().min(1, "Los nombres son obligatorios"),
  apellidos: z.string().min(1, "Los apellidos son obligatorios"),
  telefono: z.string().optional(),
  correo_personal: z.string().email("Debe ser un correo válido").optional().or(z.literal('')),
  id_cargo: z.preprocess((val) => Number(val), z.number().min(1, "El cargo es obligatorio")),
  horas_semanales: z.preprocess((val) => Number(val), z.number().min(0, "Mínimo 0 horas").optional()),
  estado: z.enum(["Activo", "Inactivo"]).optional(),
  fecha_nacimiento: z.string().optional(),
  direccion: z.string().optional(),
  fecha_ingreso: z.string().optional(),
  foto_url: z.string().optional(),
});

export type TrabajadorFormValues = z.infer<typeof trabajadorSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingTrabajadorId: number | null;
  initialData: TrabajadorFormValues;
  cargos: Cargo[];
  isSubmitting: boolean;
  onSubmit: (data: TrabajadorFormValues, photoFile: File | null) => void;
  inputCls: string;
}

const labelCls = "block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export default function TrabajadorFormModal({
  isOpen, onClose, editingTrabajadorId, initialData,
  cargos, isSubmitting, onSubmit, inputCls,
}: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TrabajadorFormValues>({
    resolver: zodResolver(trabajadorSchema) as any,
    defaultValues: initialData,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      reset(initialData);
      setPhotoFile(null);
      setPhotoPreview(initialData.foto_url || null);
    }
  }, [isOpen, initialData, reset]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const { compressImage } = await import("../../../utils/imageCompression");
        const compressed = await compressImage(file, 400, 400, 0.8);
        setPhotoFile(compressed);
        setPhotoPreview(URL.createObjectURL(compressed));
      } catch (error) {
        console.error("Error al comprimir imagen", error);
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {editingTrabajadorId !== null ? "Editar Trabajador" : "Registrar Nuevo Trabajador"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Complete los datos del trabajador. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
        </p>
        <form onSubmit={handleSubmit((data) => onSubmit(data, photoFile))} noValidate className="space-y-4">
          <div>
            <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Datos Personales</h5>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-3">
              {/* Foto de Perfil */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative group">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                  <label className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold uppercase text-center transition-all">
                    <span>Cambiar<br/>Foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              <div>
                <label className={labelCls}>Nombres <span className="text-red-500">*</span></label>
                <input
                  type="text" placeholder="Ej. Ricardo Andrés"
                  className={`${inputCls} ${errors.nombres ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  {...register("nombres")}
                />
                {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Apellidos <span className="text-red-500">*</span></label>
                <input
                  type="text" placeholder="Ej. López Martínez"
                  className={`${inputCls} ${errors.apellidos ? 'border-red-500' : ''}`}
                  {...register("apellidos")}
                />
                {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Cédula <span className="text-red-500">*</span></label>
                <input
                  type="text" placeholder="V-12345678" onKeyDown={limitNumericInput}
                  className={`${inputCls} ${errors.cedula ? 'border-red-500' : ''}`}
                  readOnly={editingTrabajadorId !== null}
                  {...register("cedula")}
                />
                {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Fecha de Nacimiento</label>
                <input
                  type="date"
                  className={inputCls + " show-date-picker"}
                  {...register("fecha_nacimiento")}
                />
              </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Contacto</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Teléfono</label>
                <input
                  type="tel" placeholder="0414-1234567" onKeyDown={limitNumericInput}
                  className={inputCls}
                  {...register("telefono")}
                />
              </div>
              <div>
                <label className={labelCls}>Correo Personal</label>
                <input
                  type="email" placeholder="ejemplo@correo.com"
                  className={`${inputCls} ${errors.correo_personal ? 'border-red-500' : ''}`}
                  {...register("correo_personal")}
                />
                {errors.correo_personal && <p className="text-red-500 text-xs mt-1">{errors.correo_personal.message}</p>}
              </div>
            </div>
            <div className="mt-3">
              <label className={labelCls}>Dirección</label>
              <input
                type="text" placeholder="Ej. Av. Principal, Urb. Las Flores, Casa N° 10"
                className={inputCls}
                {...register("direccion")}
              />
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Información Laboral</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Cargo <span className="text-red-500">*</span></label>
                <select
                  className={`${inputCls} ${errors.id_cargo ? 'border-red-500' : ''}`}
                  {...register("id_cargo")}
                >
                  <option value={0} disabled>Seleccione un cargo...</option>
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>
                  ))}
                </select>
                {errors.id_cargo && <p className="text-red-500 text-xs mt-1">{errors.id_cargo.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Horas Semanales</label>
                <input
                  type="number" onKeyDown={limitNumericInput} placeholder="Ej. 40" min={0} max={168}
                  className={`${inputCls} ${errors.horas_semanales ? 'border-red-500' : ''}`}
                  {...register("horas_semanales")}
                />
                {errors.horas_semanales && <p className="text-red-500 text-xs mt-1">{errors.horas_semanales.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Fecha de Ingreso</label>
                <input
                  type="date"
                  className={inputCls + " show-date-picker"}
                  {...register("fecha_ingreso")}
                />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select className={inputCls} {...register("estado")}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button" onClick={onClose} disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center justify-center min-w-[130px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : editingTrabajadorId !== null ? "Guardar Cambios" : "Registrar Trabajador"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
