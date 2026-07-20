import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { Cargo, HorarioDia, TrabajadorDocumento } from "../../../types";
import { limitNumericInput } from "../../../utils/validation";
import { mavetApi } from "../../../services/api";
import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

const step1Schema = z.object({
  cedula: z.string().min(1, "La cédula es obligatoria"),
  nombres: z.string().min(1, "Los nombres son obligatorios"),
  apellidos: z.string().min(1, "Los apellidos son obligatorios"),
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
  id_cargo: z.string().min(1, "El cargo es obligatorio"),
  fecha_ingreso: z.string().min(1, "La fecha de ingreso es obligatoria").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato debe ser DD/MM/AAAA").refine(val => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return true;
    const [d, m, y] = val.split('/');
    const inputDate = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
  }, "La fecha no puede ser mayor a hoy"),
  estado: z.enum(["Activo", "Inactivo"], { error: "El estado es obligatorio" }),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  correo_personal: z.string().min(1, "El correo es obligatorio").email("Debe ser un correo válido"),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  foto_url: z.string().optional(),
});

export type TrabajadorFormValues = z.infer<typeof step1Schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingTrabajadorId: string | null;
  initialData: TrabajadorFormValues;
  cargos: Cargo[];
  isSubmitting: boolean;
  onSubmit: (data: TrabajadorFormValues, horarios: HorarioDia[], photoFile: File | null, generarPin?: boolean, facialDescs?: string[], pendingDocs?: { file: File, tipo: string, notas?: string }[]) => void;
  inputCls: string;
}

const labelCls = "block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const TIPOS_DOCUMENTO = [
  { value: "contrato", label: "Contrato" },
  { value: "cv", label: "Curriculum Vitae" },
  { value: "cedula", label: "Cédula de Identidad" },
  { value: "certificado", label: "Certificado" },
  { value: "foto", label: "Foto" },
  { value: "otro", label: "Otro" },
];


const allTabs = [
  { id: "info", label: "Información" },
  { id: "horario", label: "Horario" },
  { id: "documentos", label: "Documentos" },
  { id: "facial", label: "Enrolamiento Facial" },
];

function getDefaultHorarios(): HorarioDia[] {
  return DIAS_SEMANA.map((dia) => ({
    dia_semana: dia.value,
    dia_label: dia.label,
    hora_entrada: "09:00",
    hora_salida: "17:00",
    es_dia_laborable: dia.value >= 1 && dia.value <= 5,
    observaciones: dia.value >= 1 && dia.value <= 5 ? "Horario laboral 9am-5pm (pausa 12-1pm)" : "Día no laborable",
  }));
}

export default function TrabajadorFormModal({
  isOpen, onClose, editingTrabajadorId, initialData,
  cargos, isSubmitting, onSubmit, inputCls,
}: Props) {
  const [activeTab, setActiveTab] = useState("info");
  const [vistaHorario, setVistaHorario] = useState<'lista' | 'grid'>('lista');
  const { register, handleSubmit, reset, setValue, trigger, getValues, formState: { errors } } = useForm<TrabajadorFormValues>({
    resolver: zodResolver(step1Schema) as any,
    defaultValues: initialData,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [generarPin, setGenerarPin] = useState(false);

  const [facialDescs, setFacialDescs] = useState<string[]>([]);
  const [facialStatus, setFacialStatus] = useState<"idle" | "camera" | "capturing" | "done" | "error">("idle");
  const [facialStep, setFacialStep] = useState(1);
  const [facialQualityMsg, setFacialQualityMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tabs = editingTrabajadorId !== null
    ? allTabs.filter(t => t.id !== "facial")
    : allTabs;

  const [nacionalidad, setNacionalidad] = useState("V-");
  const [numeroCedula, setNumeroCedula] = useState("");

  const [horarios, setHorarios] = useState<HorarioDia[]>(getDefaultHorarios());
  const [documentos, setDocumentos] = useState<TrabajadorDocumento[]>([]);
  const [pendingDocs, setPendingDocs] = useState<{ file: File; tipo: string; notas: string; id: string }[]>([]);

  const [loadingExtras, setLoadingExtras] = useState(false);

  const [uploadTipo, setUploadTipo] = useState("contrato");
  const [uploadNotas, setUploadNotas] = useState("");
  const [uploading, setUploading] = useState(false);


  const loadExtras = useCallback(async () => {
    if (!editingTrabajadorId) return;
    setLoadingExtras(true);
    try {
      const [h, d] = await Promise.all([
        mavetApi.getHorarios(editingTrabajadorId),
        mavetApi.getDocumentos(editingTrabajadorId),
      ]);
      if (h.length > 0) setHorarios(h);
      setDocumentos(d);
    } catch (e) {
      console.error("Error loading extras:", e);
    } finally {
      setLoadingExtras(false);
    }
  }, [editingTrabajadorId]);

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
      setPhotoError("");
      setGenerarPin(false);
      stopCamera();
      setFacialStatus("idle");
      setFacialStep(1);
      setFacialDescs([]);
      setFacialQualityMsg("");
      setActiveTab("info");
      setHorarios(getDefaultHorarios());
      setDocumentos([]);


      if (editingTrabajadorId) {
        loadExtras();
      }

      setTimeout(() => {
        fps = flatpickr(".flatpickr-wrap", {
          wrap: true,
          clickOpens: false,
          dateFormat: "d/m/Y",
          locale: Spanish,
          allowInput: true,
          onChange: function(_selectedDates, dateStr, instance) {
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
  }, [isOpen, initialData, reset, setValue, editingTrabajadorId, loadExtras]);

  useEffect(() => {
    if (numeroCedula) {
      setValue("cedula", `${nacionalidad}${numeroCedula}`, { shouldValidate: true });
    } else {
      setValue("cedula", "", { shouldValidate: true });
    }
  }, [nacionalidad, numeroCedula, setValue]);

  const handleFormSubmit = (data: TrabajadorFormValues) => {
    if (!editingTrabajadorId && !photoPreview) {
      setPhotoError("La foto es obligatoria");
      return;
    }

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

    onSubmit(finalData as TrabajadorFormValues, horarios, photoFile, generarPin, facialDescs, pendingDocs.map(d => ({ file: d.file, tipo: d.tipo, notas: d.notas })));
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const resetFacial = () => {
    stopCamera();
    setFacialStatus("idle");
    setFacialStep(1);
    setFacialDescs([]);
    setFacialQualityMsg("");
  };

  const handleStartCamera = async () => {
    setFacialStatus("camera");
    setFacialStep(1);
    setFacialDescs([]);
    try {
      const { loadModels } = await import("../../../services/face.service");
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      toast.error("No se pudo acceder a la cámara");
      setFacialStatus("idle");
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setFacialStatus("capturing");
    setFacialQualityMsg("");
    try {
      const { getDetectionWithQuality, serializeDescriptor } = await import("../../../services/face.service");
      const { detection, quality } = await getDetectionWithQuality(videoRef.current);
      if (!detection) {
        setFacialQualityMsg("No se detecta rostro. Asegúrese de estar frente a la cámara.");
        setFacialStatus("camera");
        return;
      }
      if (!quality.ok) {
        setFacialQualityMsg(quality.reason || "Ajuste su posición e iluminación.");
        setFacialStatus("camera");
        return;
      }
      const serialized = serializeDescriptor(detection.descriptor);
      const newDescs = [...facialDescs, serialized];
      setFacialDescs(newDescs);

      if (facialStep < 3) {
        setFacialStep(facialStep + 1);
        setFacialStatus("camera");
      } else {
        setFacialStatus("done");
        stopCamera();
        toast.success("Rostro enrolado exitosamente (3 capturas)");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al enrolar rostro");
      setFacialStatus("error");
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const { compressImage } = await import("../../../utils/imageCompression");
        const compressed = await compressImage(file, 400, 400, 0.8);
        setPhotoFile(compressed);
        setPhotoPreview(URL.createObjectURL(compressed));
        setPhotoError("");
      } catch (error) {
        console.error("Error al comprimir imagen", error);
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoError("");
      }
    }
  };

  const toggleDiaLaborable = (idx: number) => {
    setHorarios(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], es_dia_laborable: !next[idx].es_dia_laborable };
      return next;
    });
  };

  const updateHorarioTime = (idx: number, field: 'hora_entrada' | 'hora_salida', value: string) => {
    setHorarios(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleGeneratePDF = async () => {
    try {
      toast.loading("Generando PDF...", { id: "generate-pdf" });
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const getLogo = async (): Promise<string> => {
        const LOGO_PATH = "/images/logo/mavet2.png";
        try {
          const r = await fetch(LOGO_PATH);
          const b = await r.blob();
          return new Promise<string>((resolve) => {
            const rd = new FileReader();
            rd.onloadend = () => resolve(rd.result as string);
            rd.readAsDataURL(b);
          });
        } catch {
          return "";
        }
      };

      const logo = await getLogo();

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const burgundy = [128, 0, 0];
      const grayDark = [60, 60, 60];

      if (logo) {
        try {
          doc.addImage(logo, "PNG", 15, 14, 12, 12);
        } catch (err) {
          console.warn("Error drawing logo in PDF:", err);
        }
      }

      // Doc header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
      doc.text("MUSEO DE ARTES VISUALES Y DEL ESPACIO", 105, 20, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("MAVET · REGISTRO Y CONTROL DE HORARIOS", 105, 25, { align: "center" });

      doc.setDrawColor(burgundy[0], burgundy[1], burgundy[2]);
      doc.setLineWidth(0.4);
      doc.line(15, 28, 195, 28);

      // Info
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(grayDark[0], grayDark[1], grayDark[2]);
      doc.text("HORARIO SEMANAL DE TRABAJO", 15, 35);

      const formValues = getValues();
      const nombres = formValues.nombres || "Trabajador";
      const apellidos = formValues.apellidos || "";
      const cedula = formValues.cedula || "—";
      const cargoId = formValues.id_cargo;
      const cargoObj = cargos.find(c => c.id_cargo?.toString() === cargoId?.toString());
      const cargoLabel = cargoObj ? cargoObj.nombre_cargo : "—";

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Trabajador: ${nombres} ${apellidos}`, 15, 41);
      doc.text(`Cédula: ${cedula}`, 15, 46);
      doc.text(`Cargo: ${cargoLabel}`, 15, 51);
      doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-ES')}`, 135, 41);

      // Table layout LUN to DOM
      const tableHeaders = [["DÍA", "ESTADO", "HORA ENTRADA", "HORA SALIDA", "DETALLE / NOTAS"]];
      const orderedDays = [
        { value: 1, label: "LUNES" },
        { value: 2, label: "MARTES" },
        { value: 3, label: "MIÉRCOLES" },
        { value: 4, label: "JUEVES" },
        { value: 5, label: "VIERNES" },
        { value: 6, label: "SÁBADO" },
        { value: 0, label: "DOMINGO" },
      ];

      const tableRows = orderedDays.map((dia) => {
        const h = horarios.find(x => x.dia_semana === dia.value) || { dia_semana: dia.value, hora_entrada: "09:00", hora_salida: "17:00", es_dia_laborable: dia.value >= 1 && dia.value <= 5 };

        const format12h = (time24: string) => {
          if (!time24) return "—";
          const [hStr, mStr] = time24.split(':');
          const h = parseInt(hStr, 10) || 0;
          const m = parseInt(mStr, 10) || 0;
          const ampm = h >= 12 ? 'p. m.' : 'a. m.';
          const h12 = h % 12 || 12;
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${pad(h12)}:${pad(m)} ${ampm}`;
        };

        const entradaFmt = h.es_dia_laborable ? format12h(h.hora_entrada) : "—";
        const salidaFmt = h.es_dia_laborable ? format12h(h.hora_salida) : "—";
        const estadoText = h.es_dia_laborable ? "Laborable" : "No laborable";
        const obs = h.es_dia_laborable ? "Jornada laboral establecida" : "Día no laborable";

        return [
          dia.label,
          estadoText,
          entradaFmt,
          salidaFmt,
          obs
        ];
      });

      autoTable(doc, {
        startY: 56,
        head: tableHeaders,
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [128, 0, 0], // MAVET burgundy
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [50, 50, 50],
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 30 },
          1: { halign: "center", cellWidth: 25 },
          2: { halign: "center", cellWidth: 25 },
          3: { halign: "center", cellWidth: 25 },
          4: { cellWidth: 65 },
        },
        alternateRowStyles: {
          fillColor: [250, 247, 245],
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 25;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(30, finalY, 80, finalY);
      doc.line(130, finalY, 180, finalY);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("Firma del Trabajador", 55, finalY + 4, { align: "center" });
      doc.text("Firma de Recursos Humanos", 155, finalY + 4, { align: "center" });

      const pdfName = `Horario_${nombres.trim().replace(/\s+/g, '_')}_${apellidos.trim().replace(/\s+/g, '_')}.pdf`;
      doc.save(pdfName);

      toast.success("PDF generado correctamente", { id: "generate-pdf" });
    } catch (err: any) {
      console.error(err);
      toast.error("Error al generar PDF", { id: "generate-pdf" });
    }
  };

  const handleUploadDocumento = async () => {
    if (!editingTrabajadorId) {
      toast.error("Primero guarde el trabajador para poder subir documentos");
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const doc = await mavetApi.subirDocumento(editingTrabajadorId, file, uploadTipo, uploadNotas || undefined);
        setDocumentos(prev => [doc, ...prev]);
        setUploadNotas("");
        toast.success("Documento subido correctamente");
      } catch (err: any) {
        toast.error(err.message || "Error al subir documento");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleSelectLocalDocumento = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      
      const newDoc = {
        file,
        tipo: uploadTipo,
        notas: uploadNotas,
        id: Math.random().toString(36).substr(2, 9)
      };
      
      setPendingDocs(prev => [newDoc, ...prev]);
      setUploadNotas("");
      toast.success("Documento agregado a la lista");
    };
    input.click();
  };

  const handleRemoveLocalDocumento = (id: string) => {
    setPendingDocs(prev => prev.filter(doc => doc.id !== id));
    toast.success("Documento quitado de la lista");
  };

  const handleEliminarDocumento = async (id_documento: string) => {
    if (!editingTrabajadorId) return;
    try {
      await mavetApi.eliminarDocumento(editingTrabajadorId, id_documento);
      setDocumentos(prev => prev.filter(d => d.id_documento !== id_documento));
      toast.success("Documento eliminado");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar documento");
    }
  };


  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] p-0 overflow-hidden">
      <div className="flex flex-col max-h-[90vh]">
        <div className="px-6 pt-5 pb-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {editingTrabajadorId !== null ? "Editar Trabajador" : "Registrar Nuevo Trabajador"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Complete los datos del trabajador. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </p>
          <div className="flex gap-0 border-b border-gray-200 dark:border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === "info" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-3">
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
                  {photoError && <p className="text-red-500 text-xs mt-1">{photoError}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <div>
                    <label className={labelCls}>Nombres <span className="text-red-500">*</span></label>
                    <input
                      type="text" placeholder="Ej. Ricardo Andrés"
                      className={`${inputCls} ${errors.nombres ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                      {...register("nombres", {
                        onChange: (e) => { e.target.value = e.target.value.replace(/\d/g, ''); }
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
                        onChange: (e) => { e.target.value = e.target.value.replace(/\d/g, ''); }
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

              <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Información Laboral</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelCls}>Cargo <span className="text-red-500">*</span></label>
                  <select className={`${inputCls} ${errors.id_cargo ? 'border-red-500' : ''}`} {...register("id_cargo")}>
                    <option value={0} disabled>Seleccione un cargo...</option>
                    {cargos.map((c) => (
                      <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>
                    ))}
                  </select>
                  {errors.id_cargo && <p className="text-red-500 text-xs mt-1">{errors.id_cargo.message}</p>}
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

              <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Contacto</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Teléfono <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="0414-1234567" onKeyDown={limitNumericInput}
                    className={`${inputCls} ${errors.telefono ? 'border-red-500' : ''}`}
                    {...register("telefono")}
                  />
                  {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Correo Personal <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="ejemplo@correo.com"
                    className={`${inputCls} ${errors.correo_personal ? 'border-red-500' : ''}`}
                    {...register("correo_personal")}
                  />
                  {errors.correo_personal && <p className="text-red-500 text-xs mt-1">{errors.correo_personal.message}</p>}
                </div>
              </div>
              <div className="mt-3">
                <label className={labelCls}>Dirección <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Ej. Av. Principal, Urb. Las Flores, Casa N° 10"
                  className={`${inputCls} ${errors.direccion ? 'border-red-500' : ''}`}
                  {...register("direccion")}
                />
                {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>}
              </div>

              {!editingTrabajadorId && (
                <div className="mt-4">
                  <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Opción de Asistencia</h5>
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input type="checkbox" checked={generarPin} onChange={(e) => setGenerarPin(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/30"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Generar PIN</span>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">El trabajador podrá marcar asistencia con PIN</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {activeTab === "horario" && (
            <div>
              {/* Selector de Vistas y Botón de PDF */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVistaHorario('lista')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      vistaHorario === 'lista'
                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm border border-gray-200/50 dark:border-gray-700'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Vista Actual
                  </button>
                  <button
                    type="button"
                    onClick={() => setVistaHorario('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      vistaHorario === 'grid'
                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm border border-gray-200/50 dark:border-gray-700'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Formato de Horario
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGeneratePDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generar PDF
                  </button>
                </div>
              </div>
 
              {/* VISTA 1: LISTADO (VISTA ACTUAL) */}
              {vistaHorario === 'lista' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Horario Semanal
                    </h5>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                      Horario fijo 9:00am - 5:00pm · Pausa 12:00pm - 1:00pm
                    </p>
                  </div>
 
                  {loadingExtras ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {DIAS_SEMANA.map((dia, idx) => {
                        const h = horarios[idx] || { dia_semana: dia.value, hora_entrada: "09:00", hora_salida: "17:00", es_dia_laborable: dia.value >= 1 && dia.value <= 5 };
                        return (
                          <div key={dia.value} className={`flex items-center justify-between gap-4 p-3 rounded-lg border transition-all duration-200 ${
                            h.es_dia_laborable
                              ? "border-brand-200 dark:border-brand-900 bg-brand-50/20 dark:bg-brand-950/10 shadow-sm"
                              : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 opacity-70"
                          }`}>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={h.es_dia_laborable}
                                onChange={() => toggleDiaLaborable(idx)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-600 dark:text-brand-400 focus:ring-brand-500/30 cursor-pointer"
                              />
                              <span className={`text-xs font-semibold ${
                                h.es_dia_laborable ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500 font-normal"
                              }`}>
                                {dia.label}
                              </span>
                            </div>
 
                            <div className="flex items-center gap-3">
                              {h.es_dia_laborable ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="time"
                                    value={h.hora_entrada}
                                    onChange={(e) => updateHorarioTime(idx, 'hora_entrada', e.target.value)}
                                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-32 shadow-sm"
                                  />
                                  <span className="text-xs text-gray-400 dark:text-gray-500 italic">a</span>
                                  <input
                                    type="time"
                                    value={h.hora_salida}
                                    onChange={(e) => updateHorarioTime(idx, 'hora_salida', e.target.value)}
                                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-32 shadow-sm"
                                  />
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic select-none mr-4">No laborable</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
 
                  {editingTrabajadorId && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={async () => {
                          const id = editingTrabajadorId as string;
                          try {
                            await mavetApi.guardarHorarios(id, horarios);
                            toast.success("Horario guardado correctamente");
                          } catch (err: any) {
                            toast.error(err.message || "Error al guardar horario");
                          }
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-sm focus:outline-none"
                      >
                        Guardar Horario
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VISTA 2: GRID CLÁSICO (FORMATO DE HORARIO DE TRABAJO) */}
              {vistaHorario === 'grid' && (
                <div className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-x-auto min-h-[500px] select-none">
                  {/* Título en mayúsculas, negrita y estilo limpio */}
                  <div className="flex flex-col items-center mb-6">
                    <h3 className="text-base font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                      HORARIO DE TRABAJO
                    </h3>
                  </div>

                  {/* Tabla Matriz */}
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 mx-auto max-w-5xl">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                        <th className="p-3 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-28 text-center animate-none">
                          ENT / SAL
                        </th>
                        {[
                          { value: 1, label: "LUN" },
                          { value: 2, label: "MAR" },
                          { value: 3, label: "MIE" },
                          { value: 4, label: "JUE" },
                          { value: 5, label: "VIE" },
                          { value: 6, label: "SAB" },
                          { value: 0, label: "DOM" },
                        ].map((col) => (
                          <th key={col.value} className="p-3 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider text-center">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "08:00 - 09:00", start: "08:00", end: "09:00" },
                        { label: "09:00 - 10:00", start: "09:00", end: "10:00" },
                        { label: "10:00 - 11:00", start: "10:00", end: "11:00" },
                        { label: "11:00 - 12:00", start: "11:00", end: "12:00" },
                        { label: "12:00 - 13:00", start: "12:00", end: "13:00" },
                        { label: "13:00 - 14:00", start: "13:00", end: "14:00" },
                        { label: "14:00 - 15:00", start: "14:00", end: "15:00" },
                        { label: "15:00 - 16:00", start: "15:00", end: "16:00" },
                        { label: "16:00 - 17:00", start: "16:00", end: "17:00" },
                        { label: "17:00 - 18:00", start: "17:00", end: "18:00" },
                      ].map((fila, fIdx) => (
                        <tr key={fIdx} className="border-b border-gray-300 dark:border-gray-700">
                          <td className="p-3 border border-gray-300 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800 text-center select-none">
                            {fila.label}
                          </td>
                          {[1, 2, 3, 4, 5, 6, 0].map((dayValue) => {
                            // Helper logic inside render block
                            const getIsCellActive = () => {
                              const diaHorario = horarios.find(h => h.dia_semana === dayValue);
                              if (!diaHorario || !diaHorario.es_dia_laborable) return false;

                              const parseToMinutes = (timeStr: string) => {
                                if (!timeStr) return 0;
                                const parts = timeStr.split(':');
                                const h = parseInt(parts[0], 10) || 0;
                                const m = parseInt(parts[1], 10) || 0;
                                return h * 60 + m;
                              };

                              const entrada = parseToMinutes(diaHorario.hora_entrada);
                              const salida = parseToMinutes(diaHorario.hora_salida);
                              const slotStart = parseToMinutes(fila.start);
                              const slotEnd = parseToMinutes(fila.end);

                              return Math.max(entrada, slotStart) < Math.min(salida, slotEnd);
                            };

                            const active = getIsCellActive();
                            const isLunch = fila.start === "12:00" && fila.end === "13:00";

                            return (
                              <td key={dayValue} className="p-1.5 border border-gray-300 dark:border-gray-700 h-12 relative min-w-[80px] bg-white dark:bg-gray-900">
                                {active ? (
                                  isLunch ? (
                                    <div className="absolute inset-1 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-850/40 rounded flex items-center justify-center shadow-sm select-none">
                                      <span className="text-[10px] font-bold tracking-wide uppercase">Pausa</span>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-1 bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-850/40 rounded flex items-center justify-center shadow-sm select-none">
                                      <span className="text-[10px] font-bold tracking-wide uppercase">Laboral</span>
                                    </div>
                                  )
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-4 text-right">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      * Vista de horario semanal institucional - MAVET
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "facial" && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-100 dark:bg-brand-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h.01M9 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 15h6" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Enrolamiento Facial Obligatorio</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Se tomarán <strong>3 capturas</strong> en diferentes condiciones para el reconocimiento.
                Solo se almacenan vectores numéricos, no imágenes.
              </p>

              {facialStatus === "idle" && (
                <button type="button" onClick={handleStartCamera}
                  className="px-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition text-sm">
                  Iniciar Cámara
                </button>
              )}

              {(facialStatus === "camera" || facialStatus === "capturing") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3].map((step) => (
                      <div key={step}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                          step === facialStep
                            ? "bg-brand-500 text-white border-brand-500"
                            : step < facialStep
                            ? "bg-success-500 text-white border-success-500"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600"
                        }`}>
                        {step < facialStep ? "✓" : step}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {facialStep === 1 && "Foto 1: Mire de frente, con buena iluminación"}
                    {facialStep === 2 && "Foto 2: Gire ligeramente el rostro"}
                    {facialStep === 3 && "Foto 3: Cambie el ángulo o sonría ligeramente"}
                  </p>

                  <div className="relative mx-auto w-64 h-48 rounded-xl overflow-hidden bg-gray-900 border-2 border-brand-500">
                    <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {facialQualityMsg && (
                    <p className="text-xs text-amber-600 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {facialQualityMsg}
                    </p>
                  )}

                  <button type="button" onClick={handleCapture} disabled={facialStatus === "capturing"}
                    className="px-6 py-3 bg-success-500 text-white rounded-xl font-bold hover:bg-success-600 transition disabled:opacity-60 text-sm">
                    {facialStatus === "capturing" ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : facialStep < 3 ? (
                      `Capturar Foto ${facialStep}/3`
                    ) : (
                      "Capturar y Finalizar (3/3)"
                    )}
                  </button>
                </div>
              )}

              {facialStatus === "done" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">Enrolamiento completado (3 capturas)</p>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-1">El trabajador podrá usar verificación facial en el kiosko.</p>
                </div>
              )}

              {facialStatus === "error" && (
                <div className="space-y-3">
                  <p className="text-sm text-red-600">Error al enrolar. Intente nuevamente.</p>
                  <button type="button" onClick={resetFacial}
                    className="px-6 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition text-sm">
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "documentos" && (
            <div>
              <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Documentos del Trabajador</h5>

              <div className="flex items-end gap-3 mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                <div className="flex-1">
                  <label className={labelCls}>Tipo de Documento</label>
                  <select
                    value={uploadTipo}
                    onChange={(e) => setUploadTipo(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    {TIPOS_DOCUMENTO.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Notas (opcional)</label>
                  <input
                    type="text"
                    value={uploadNotas}
                    onChange={(e) => setUploadNotas(e.target.value)}
                    placeholder="Breve descripción"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={editingTrabajadorId ? handleUploadDocumento : handleSelectLocalDocumento}
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-60 flex items-center gap-1"
                >
                  {uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  )}
                  Subir Archivo
                </button>
              </div>

              {editingTrabajadorId ? (
                documentos.length === 0 ? (
                  <div className="p-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm text-gray-400">No hay documentos subidos</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documentos.map(doc => (
                      <div key={doc.id_documento} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                        <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{doc.nombre_archivo}</p>
                          <p className="text-[10px] text-gray-500">
                            {TIPOS_DOCUMENTO.find(t => t.value === doc.tipo_documento)?.label || doc.tipo_documento}
                            {doc.tamano_archivo && ` · ${formatFileSize(doc.tamano_archivo)}`}
                            {doc.notas && ` · ${doc.notas}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <a
                            href={doc.ruta_archivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-500 hover:text-brand-600 transition-colors"
                            title="Ver documento"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleEliminarDocumento(doc.id_documento)}
                            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                            title="Eliminar documento"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                pendingDocs.length === 0 ? (
                  <div className="p-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm text-gray-400">No hay documentos seleccionados para subir</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingDocs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                        <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{doc.file.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {TIPOS_DOCUMENTO.find(t => t.value === doc.tipo)?.label || doc.tipo}
                            {` · ${formatFileSize(doc.file.size)}`}
                            {doc.notas && ` · ${doc.notas}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveLocalDocumento(doc.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                            title="Quitar documento"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}


          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              {activeTab !== "info" && (
                <button
                  type="button" onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1].id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Anterior
                </button>
              )}
            </div>
            <div className="flex gap-2.5">
              <button
                type="button" onClick={onClose} disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              {activeTab !== tabs[tabs.length - 1].id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "info") {
                      const fieldsToValidate = ["cedula", "nombres", "apellidos", "fecha_nacimiento", "id_cargo", "fecha_ingreso", "estado", "telefono", "correo_personal", "direccion"];
                      trigger(fieldsToValidate as any).then(valid => {
                        if (valid) {
                          const idx = tabs.findIndex(t => t.id === activeTab);
                          setActiveTab(tabs[idx + 1].id);
                        }
                      });
                    } else {
                      const idx = tabs.findIndex(t => t.id === activeTab);
                      setActiveTab(tabs[idx + 1].id);
                    }
                  }}
                  className="px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit" disabled={isSubmitting}
                  className="flex items-center justify-center min-w-[130px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : editingTrabajadorId !== null ? "Guardar Cambios" : "Registrar Trabajador"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
