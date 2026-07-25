import { useState, useRef, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { mavetApi } from "../../../services/api";
import { limitNumericInput } from "../../../utils/validation";
import { AlertCircle, Check, Upload, ArrowRight, ArrowLeft, Save, X, Calendar, Clock, Users, FileText, Plus } from "lucide-react";
import toast from "react-hot-toast";

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
    documentoPlanUrl: string;
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
  onInstructorCreated: () => void;
  onInventarioCreated: () => void;
}

import { inputCls as baseInputCls, selectCls as baseSelectCls, labelCls, modalCls } from "../../../utils/formClasses";

export default function TallerDetailModal({
  isOpen, onClose, isEditing, formData,
  inventario, instructores, espacios,
  isSubmitting, formError, onChange, onEstadoChange, onDocumentoPlanChange, onSubmit,
  onInstructorCreated, onInventarioCreated,
}: Props) {
  const [step, setStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const [instructorInput, setInstructorInput] = useState("");
  const [instructorDropdownOpen, setInstructorDropdownOpen] = useState(false);
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [instructorSubmitting, setInstructorSubmitting] = useState(false);
  const [instructorFormData, setInstructorFormData] = useState({
    nombres: "", apellidos: "", cedula: "", telefono: "", fecha_nacimiento: "",
    profesion: "", especialidad: "",
  });
  const [motivos, setMotivos] = useState<any[]>([]);
  const instructorDropdownRef = useRef<HTMLDivElement>(null);

  const [inventarioInput, setInventarioInput] = useState("");
  const [inventarioDropdownOpen, setInventarioDropdownOpen] = useState(false);
  const [inventarioModalOpen, setInventarioModalOpen] = useState(false);
  const [inventarioSubmitting, setInventarioSubmitting] = useState(false);
  const [inventarioFormData, setInventarioFormData] = useState({ nombre: "", descripcion: "" });
  const inventarioDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (instructorModalOpen) {
      mavetApi.obtenerMotivos().then(setMotivos).catch(() => {});
    }
  }, [instructorModalOpen]);

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (instructorDropdownRef.current && !instructorDropdownRef.current.contains(e.target as Node)) {
        setInstructorDropdownOpen(false);
      }
      if (inventarioDropdownRef.current && !inventarioDropdownRef.current.contains(e.target as Node)) {
        setInventarioDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && formData.selectedInstructorId && instructores.length > 0) {
      const selected = instructores.find((i: any) => i.id_instructor === formData.selectedInstructorId);
      if (selected) {
        const p = selected.Persona || {};
        setInstructorInput(`${p.nombres || ""} ${p.apellidos || ""}`.trim());
      }
    }
    if (!isOpen) {
      setInstructorInput("");
      setInstructorDropdownOpen(false);
    }
  }, [isOpen, formData.selectedInstructorId, instructores]);

  useEffect(() => {
    if (isOpen && formData.id_taller_inventario && inventario.length > 0) {
      const selected = inventario.find((i: any) => (i.id_taller || i.id) === formData.id_taller_inventario);
      if (selected) {
        setInventarioInput(selected.nombre || "");
      }
    }
    if (!isOpen) {
      setInventarioInput("");
      setInventarioDropdownOpen(false);
    }
  }, [isOpen, formData.id_taller_inventario, inventario]);

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
    <>
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
                <div className="relative" ref={inventarioDropdownRef}>
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <input type="text" placeholder="Buscar o escribir nombre del taller..."
                    value={inventarioInput}
                    onChange={(e) => {
                      setInventarioInput(e.target.value);
                      setInventarioDropdownOpen(true);
                      if (!e.target.value.trim()) {
                        onChange({ target: { name: 'id_taller_inventario', value: '' } } as any);
                      }
                    }}
                    onFocus={() => setInventarioDropdownOpen(true)}
                    className={baseInputCls + " pl-10"} required />
                  {inventarioDropdownOpen && (() => {
                    const query = inventarioInput.toLowerCase().trim();
                    const filtered = query
                      ? inventario.filter((i: any) =>
                          (i.nombre || "").toLowerCase().includes(query) ||
                          (i.descripcion || "").toLowerCase().includes(query)
                        )
                      : inventario;
                    return (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                        {filtered.length === 0 && query.length >= 2 ? (
                          <div className="p-3 text-sm text-gray-500 dark:text-gray-400">Sin coincidencias</div>
                        ) : (
                          filtered.map((i: any) => {
                            const id = i.id_taller || i.id;
                            const selected = formData.id_taller_inventario === id;
                            return (
                              <button key={id} type="button"
                                onClick={() => {
                                  setInventarioInput(i.nombre || "");
                                  setInventarioDropdownOpen(false);
                                  onChange({ target: { name: 'id_taller_inventario', value: id } } as any);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${selected ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300" : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"}`}>
                                <svg className={`w-4 h-4 shrink-0 ${selected ? "text-brand-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{i.nombre}</div>
                                  {i.descripcion && <div className="text-[11px] text-gray-400 truncate">{i.descripcion}</div>}
                                </div>
                                {selected && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
                              </button>
                            );
                          })
                        )}
                        <div className="border-t border-gray-100 dark:border-gray-700">
                          <button type="button"
                            onClick={() => {
                              setInventarioModalOpen(true);
                              setInventarioDropdownOpen(false);
                              if (inventarioInput.trim() && !inventario.some((i: any) => (i.nombre || "").toLowerCase() === inventarioInput.toLowerCase().trim())) {
                                setInventarioFormData({ nombre: inventarioInput.trim(), descripcion: "" });
                              } else {
                                setInventarioFormData({ nombre: "", descripcion: "" });
                              }
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors flex items-center gap-3">
                            <Plus className="w-4 h-4" />
                            {inventarioInput.trim() && !inventario.some((i: any) => (i.nombre || "").toLowerCase() === inventarioInput.toLowerCase().trim())
                              ? `Agregar "${inventarioInput.trim()}"`
                              : "Nuevo taller en inventario"}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className={labelCls}>Instructor</label>
                <div className="relative" ref={instructorDropdownRef}>
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar o escribir nombre del instructor..."
                    value={instructorInput}
                    onChange={(e) => {
                      setInstructorInput(e.target.value);
                      setInstructorDropdownOpen(true);
                      if (!e.target.value.trim()) {
                        onChange({ target: { name: 'selectedInstructorId', value: '' } } as any);
                      }
                    }}
                    onFocus={() => setInstructorDropdownOpen(true)}
                    className={baseInputCls + " pl-10"}
                    required
                  />
                  {instructorDropdownOpen && (() => {
                    const query = instructorInput.trim().toLowerCase();
                    const filtered = query
                      ? instructores.filter((inst: any) => {
                          const p = inst.Persona || {};
                          const fullName = `${p.nombres || ""} ${p.apellidos || ""}`.trim().toLowerCase();
                          return fullName.includes(query) || (p.cedula && p.cedula.includes(query));
                        })
                      : instructores;
                    if (filtered.length === 0 && query.length >= 2) {
                      return (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">Sin coincidencias</div>
                          <div
                            onClick={() => {
                              const [nombres, ...apellidosArr] = query.split(" ");
                              setInstructorFormData({
                                nombres: nombres || "",
                                apellidos: apellidosArr.join(" ") || "",
                                cedula: "", telefono: "", fecha_nacimiento: "",
                                profesion: "", especialidad: "",
                              });
                              setInstructorModalOpen(true);
                              setInstructorDropdownOpen(false);
                            }}
                            className="px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 cursor-pointer flex items-center gap-2 font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar &quot;{query}&quot;
                          </div>
                        </div>
                      );
                    }
                    if (filtered.length === 0) return null;
                    return (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filtered.map((inst: any) => {
                          const p = inst.Persona || {};
                          const name = `${p.nombres || ""} ${p.apellidos || ""}`.trim();
                          return (
                            <div
                              key={inst.id_instructor}
                              onClick={() => {
                                setInstructorInput(name);
                                setInstructorDropdownOpen(false);
                                onChange({ target: { name: 'selectedInstructorId', value: inst.id_instructor } } as any);
                              }}
                              className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                            >
                              <span className="text-gray-800 dark:text-white">{name}</span>
                              {p.cedula && <span className="text-[11px] text-gray-400">{p.cedula}</span>}
                            </div>
                          );
                        })}
                        <div
                          onClick={() => {
                            const [nombres, ...apellidosArr] = query ? query.split(" ") : ["", ""];
                            setInstructorFormData({
                              nombres: nombres || "",
                              apellidos: apellidosArr.join(" ") || "",
                              cedula: "", telefono: "", fecha_nacimiento: "",
                              profesion: "", especialidad: "",
                            });
                            setInstructorModalOpen(true);
                            setInstructorDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 cursor-pointer flex items-center gap-2 font-medium border-t border-gray-100 dark:border-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                          {query ? `Agregar "${query}"` : "Nuevo instructor"}
                        </div>
                      </div>
                    );
                  })()}
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
                    : formData.documentoPlanUrl
                      ? "border-sky-400 bg-sky-50 dark:bg-sky-500/10 dark:border-sky-600"
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
                ) : formData.documentoPlanUrl ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/20 shrink-0">
                      <svg className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sky-700 dark:text-sky-400 truncate">Documento actual</p>
                      <p className="text-xs text-gray-500">Toca para reemplazar</p>
                    </div>
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

      <Modal isOpen={instructorModalOpen} onClose={() => setInstructorModalOpen(false)} className="max-w-[540px] p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nuevo Instructor</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!instructorFormData.nombres.trim()) { toast.error("El nombre es obligatorio"); return; }
            if (!instructorFormData.cedula.trim()) { toast.error("La cédula es obligatoria"); return; }
            setInstructorSubmitting(true);
            try {
              const personaRes = await mavetApi.registrarIngreso({
                cedula: instructorFormData.cedula,
                nombres: instructorFormData.nombres.trim(),
                apellidos: instructorFormData.apellidos.trim() || ".",
                telefono: instructorFormData.telefono || undefined,
                fecha_nacimiento: instructorFormData.fecha_nacimiento || undefined,
                id_motivo: "MVI-00001",
                cantidad_acompanantes: 0,
                consentimiento_datos: true,
              });
              const personaId = personaRes.data?.persona?.id_persona || personaRes.data?.id_persona || personaRes.data?.id;
              if (!personaId) throw new Error("No se pudo crear la persona");
              const instructorRes = await mavetApi.crearInstructor({
                id_persona: personaId,
                profesion: instructorFormData.profesion || undefined,
                especialidad: instructorFormData.especialidad || undefined,
              });
              const newId = instructorRes.data?.id_instructor || instructorRes.data?.id;
              if (!newId) throw new Error("No se pudo crear el instructor");
              const personName = `${instructorFormData.nombres.trim()} ${instructorFormData.apellidos.trim() || ""}`.trim();
              setInstructorInput(personName);
              onChange({ target: { name: 'selectedInstructorId', value: newId.toString() } } as any);
              setInstructorModalOpen(false);
              toast.success("Instructor creado exitosamente");
              onInstructorCreated();
            } catch (err: any) {
              toast.error(err.message || "Error al crear instructor");
            } finally {
              setInstructorSubmitting(false);
            }
          }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Nombres <span className="text-red-500">*</span></label>
                <input type="text" value={instructorFormData.nombres}
                  onChange={(e) => setInstructorFormData((p) => ({ ...p, nombres: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" required />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Apellidos</label>
                <input type="text" value={instructorFormData.apellidos}
                  onChange={(e) => setInstructorFormData((p) => ({ ...p, apellidos: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Cédula <span className="text-red-500">*</span></label>
                <input type="text" value={instructorFormData.cedula}
                  onChange={(e) => setInstructorFormData((p) => ({ ...p, cedula: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" required />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Teléfono</label>
                <input type="tel" value={instructorFormData.telefono} onKeyDown={limitNumericInput}
                  onChange={(e) => setInstructorFormData((p) => ({ ...p, telefono: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Fecha de Nacimiento</label>
              <input type="date" value={instructorFormData.fecha_nacimiento}
                onChange={(e) => setInstructorFormData((p) => ({ ...p, fecha_nacimiento: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Profesión</label>
                <input type="text" value={instructorFormData.profesion}
                  onChange={(e) => setInstructorFormData((p) => ({ ...p, profesion: e.target.value }))}
                  placeholder="Ej. Artista plástico"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Especialidad</label>
                <input type="text" value={instructorFormData.especialidad}
                  onChange={(e) => setInstructorFormData((p) => ({ ...p, especialidad: e.target.value }))}
                  placeholder="Ej. Pintura al óleo"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => setInstructorModalOpen(false)} disabled={instructorSubmitting}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={instructorSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {instructorSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Guardar"}
                {instructorSubmitting ? " Guardando..." : ""}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={inventarioModalOpen} onClose={() => setInventarioModalOpen(false)} className="max-w-[480px] p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nuevo Taller en Inventario</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!inventarioFormData.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
            setInventarioSubmitting(true);
            try {
              await mavetApi.crearInventarioTaller({
                nombre: inventarioFormData.nombre.trim(),
                descripcion: inventarioFormData.descripcion.trim(),
              });
              const refreshed = await mavetApi.getInventarioTalleres();
              const nuevo = refreshed.data.find((t: any) => (t.nombre || "").toLowerCase() === inventarioFormData.nombre.trim().toLowerCase());
              if (nuevo) {
                const id = nuevo.id_taller || nuevo.id;
                setInventarioInput(nuevo.nombre);
                onChange({ target: { name: 'id_taller_inventario', value: id } } as any);
              }
              setInventarioModalOpen(false);
              toast.success("Taller agregado al inventario");
              onInventarioCreated();
            } catch (err: any) {
              toast.error(err.message || "Error al crear taller");
            } finally {
              setInventarioSubmitting(false);
            }
          }} className="space-y-3">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Nombre del Taller <span className="text-red-500">*</span></label>
              <input type="text" value={inventarioFormData.nombre}
                onChange={(e) => setInventarioFormData((p) => ({ ...p, nombre: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Descripción</label>
              <textarea rows={3} value={inventarioFormData.descripcion}
                onChange={(e) => setInventarioFormData((p) => ({ ...p, descripcion: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90 resize-none" />
            </div>
            <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => setInventarioModalOpen(false)} disabled={inventarioSubmitting}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={inventarioSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {inventarioSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Guardar Taller"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
