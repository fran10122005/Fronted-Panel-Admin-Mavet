import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { Cargo } from "../../../types";
import { limitNumericInput } from "../../../utils/validation";
import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";

const trabajadorSchema = z.object({
  cedula: z.string().min(1, "La cédula es obligatoria"),
  nombres: z.string().min(1, "Los nombres son obligatorios"),
  apellidos: z.string().min(1, "Los apellidos son obligatorios"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  correo_personal: z.string().min(1, "El correo es obligatorio").email("Debe ser un correo válido"),
  id_cargo: z.string().min(1, "El cargo es obligatorio"),
  horas_semanales: z.preprocess((val) => val === "" || val === undefined ? undefined : Number(val), z.number({ required_error: "Las horas son obligatorias" }).min(5, "Mínimo 5 horas")),
  estado: z.enum(["Activo", "Inactivo"], { required_error: "El estado es obligatorio" }),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato debe ser DD/MM/AAAA").refine(val => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return true;
    const [d, m, y] = val.split('/');
    const birthDate = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18 && age <= 80;
  }, "El trabajador debe tener entre 18 y 80 años"),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  fecha_ingreso: z.string().min(1, "La fecha de ingreso es obligatoria").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato debe ser DD/MM/AAAA").refine(val => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return true;
    const [d, m, y] = val.split('/');
    const inputDate = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
  }, "La fecha no puede ser mayor a hoy"),
  foto_url: z.string().optional(),
});

export type TrabajadorFormValues = z.infer<typeof trabajadorSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingTrabajadorId: string | null;
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
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TrabajadorFormValues>({
    resolver: zodResolver(trabajadorSchema) as any,
    defaultValues: initialData,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [nacionalidad, setNacionalidad] = useState("V-");
  const [numeroCedula, setNumeroCedula] = useState("");

  useEffect(() => {
    let fps: flatpickr.Instance | flatpickr.Instance[] | null = null;
    if (isOpen) {
      const formatDateForInput = (dateStr?: string) => {
        if (!dateStr) return dateStr;
        if (dateStr.includes('-')) {
          const [y, m, d] = dateStr.split('-');
          return `${d}/${m}/${y}`;
        }
        return dateStr;
      };

      const formattedInitialData = {
        ...initialData,
        fecha_nacimiento: formatDateForInput(initialData.fecha_nacimiento),
        fecha_ingreso: formatDateForInput(initialData.fecha_ingreso),
      };

      const initialCedula = initialData.cedula || "";
      let nacio = "V-";
      let numStr = initialCedula;

      if (initialCedula.toUpperCase().startsWith("E-")) {
        nacio = "E-";
        numStr = initialCedula.substring(2);
      } else if (initialCedula.toUpperCase().startsWith("V-")) {
        nacio = "V-";
        numStr = initialCedula.substring(2);
      }

      setNacionalidad(nacio);
      setNumeroCedula(numStr.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, "."));

      reset(formattedInitialData);
      setPhotoFile(null);
      setPhotoPreview(initialData.foto_url || null);

      setTimeout(() => {
        fps = flatpickr(".flatpickr-wrap", {
          wrap: true,
          clickOpens: false,
          dateFormat: "d/m/Y",
          locale: Spanish,
          allowInput: true,
          onChange: function(selectedDates, dateStr, instance) {
            const inputElement = instance.input;
            const inputName = inputElement.getAttribute("name");
            if (inputName) {
              setValue(inputName as any, dateStr, { shouldValidate: true, shouldDirty: true });
            }
          }
        });
      }, 50);
    }
    return () => {
      if (fps) {
        if (Array.isArray(fps)) fps.forEach(f => f.destroy());
        else fps.destroy();
      }
    };
  }, [isOpen, initialData, reset, setValue]);

  useEffect(() => {
    if (numeroCedula) {
      setValue("cedula", `${nacionalidad}${numeroCedula}`, { shouldValidate: true });
    } else {
      setValue("cedula", "", { shouldValidate: true });
    }
  }, [nacionalidad, numeroCedula, setValue]);

  const handleFormSubmit = (data: TrabajadorFormValues) => {
    const parseDate = (dateStr?: string) => {
      if (!dateStr) return dateStr;
      if (dateStr.includes('/')) {
        const [d, m, y] = dateStr.split('/');
        return `${y}-${m}-${d}`;
      }
      return dateStr;
    };

    const finalData = {
      ...data,
      fecha_nacimiento: parseDate(data.fecha_nacimiento),
      fecha_ingreso: parseDate(data.fecha_ingreso),
    };

    onSubmit(finalData, photoFile);
  };

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
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
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
                  {...register("nombres", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\d/g, '');
                    }
                  })}
                />
                {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Apellidos <span className="text-red-500">*</span></label>
                <input
                  type="text" placeholder="Ej. López Martínez"
                  className={`${inputCls} ${errors.apellidos ? 'border-red-500' : ''}`}
                  {...register("apellidos", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\d/g, '');
                    }
                  })}
                />
                {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Cédula <span className="text-red-500">*</span></label>
                <div className="flex w-full">
                  <select 
                    className={`${inputCls.replace('w-full', '')} w-16 px-2 rounded-r-none border-r-0 text-center`}
                    value={nacionalidad}
                    onChange={(e) => setNacionalidad(e.target.value)}
                    disabled={editingTrabajadorId !== null}
                  >
                    <option value="V-">V-</option>
                    <option value="E-">E-</option>
                  </select>
                  <input
                    type="text" placeholder="12.345.678" onKeyDown={limitNumericInput}
                    className={`${inputCls.replace('w-full', '')} flex-1 min-w-0 rounded-l-none border-l-0 ${errors.cedula ? 'border-red-500' : ''}`}
                    value={numeroCedula}
                    onChange={(e) => {
                      let num = e.target.value.replace(/\D/g, '');
                      num = num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                      setNumeroCedula(num);
                    }}
                    readOnly={editingTrabajadorId !== null}
                  />
                  <input type="hidden" {...register("cedula")} />
                </div>
                {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Fecha de Nacimiento <span className="text-red-500">*</span></label>
                <div className="flatpickr-wrap relative flex items-center">
                  <input
                    type="text" placeholder="DD/MM/AAAA" data-input maxLength={10}
                    className={`${inputCls} w-full pr-10 ${errors.fecha_nacimiento ? 'border-red-500' : ''}`}
                    {...register("fecha_nacimiento", {
                      onChange: (e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2);
                        if (val.length > 5) val = val.slice(0,5) + '/' + val.slice(5,9);
                        e.target.value = val;
                      }
                    })}
                  />
                  <button type="button" title="Abrir calendario" data-toggle className="absolute right-2 text-gray-400 hover:text-brand-500 focus:outline-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
                {errors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento.message}</p>}
              </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Contacto</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Teléfono <span className="text-red-500">*</span></label>
                <input
                  type="tel" placeholder="0414-1234567" onKeyDown={limitNumericInput}
                  className={`${inputCls} ${errors.telefono ? 'border-red-500' : ''}`}
                  {...register("telefono")}
                />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Correo Personal <span className="text-red-500">*</span></label>
                <input
                  type="email" placeholder="ejemplo@correo.com"
                  className={`${inputCls} ${errors.correo_personal ? 'border-red-500' : ''}`}
                  {...register("correo_personal")}
                />
                {errors.correo_personal && <p className="text-red-500 text-xs mt-1">{errors.correo_personal.message}</p>}
                {!errors.correo_personal && <p className="text-[10px] text-gray-400 mt-0.5">Solo informativo. No se usa como acceso al sistema.</p>}
              </div>
            </div>
            <div className="mt-3">
              <label className={labelCls}>Dirección <span className="text-red-500">*</span></label>
              <input
                type="text" placeholder="Ej. Av. Principal, Urb. Las Flores, Casa N° 10"
                className={`${inputCls} ${errors.direccion ? 'border-red-500' : ''}`}
                {...register("direccion")}
              />
              {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>}
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
                <label className={labelCls}>Horas Semanales <span className="text-red-500">*</span></label>
                <input
                  type="number" onKeyDown={limitNumericInput} placeholder="Ej. 40" min={0} max={168}
                  className={`${inputCls} ${errors.horas_semanales ? 'border-red-500' : ''}`}
                  {...register("horas_semanales")}
                />
                {errors.horas_semanales && <p className="text-red-500 text-xs mt-1">{errors.horas_semanales.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Fecha de Ingreso <span className="text-red-500">*</span></label>
                <div className="flatpickr-wrap relative flex items-center">
                  <input
                    type="text" placeholder="DD/MM/AAAA" data-input maxLength={10}
                    className={`${inputCls} w-full pr-10 ${errors.fecha_ingreso ? 'border-red-500' : ''}`}
                    {...register("fecha_ingreso", {
                      onChange: (e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2);
                        if (val.length > 5) val = val.slice(0,5) + '/' + val.slice(5,9);
                        e.target.value = val;
                      }
                    })}
                  />
                  <button type="button" title="Abrir calendario" data-toggle className="absolute right-2 text-gray-400 hover:text-brand-500 focus:outline-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
                {errors.fecha_ingreso && <p className="text-red-500 text-xs mt-1">{errors.fecha_ingreso.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Estado <span className="text-red-500">*</span></label>
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
