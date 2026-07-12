import { useState } from "react";
import { mavetApi } from "../services/api";
import toast from "react-hot-toast";

const INITIAL_ENROLL_FORM = {
  tallerId: "",
  alumnoCedula: "",
  alumnoNombre: "",
  alumnoEdad: "",
  repNombre: "",
  repCedula: "",
  repTelefono: "",
  correo: "",
};

export function useTalleresInscripciones(
  setInscripciones: React.Dispatch<React.SetStateAction<any[]>>,
  setConfirm: React.Dispatch<React.SetStateAction<any>>,
  selectedTallerFromParent: any,
) {
  const [enrollForm, setEnrollForm] = useState(INITIAL_ENROLL_FORM);
  const [selectedTallerEnroll, setSelectedTallerEnroll] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState<any>(null);
  const [tallerInscripciones, setTallerInscripciones] = useState<any[]>([]);
  const [isOpenEnroll, setIsOpenEnroll] = useState(false);
  const [isOpenInscr, setIsOpenInscr] = useState(false);

  const edadNum = parseInt(enrollForm.alumnoEdad, 10);
  const esMenor = !isNaN(edadNum) && edadNum < 18;

  const openEnroll = (taller: any) => {
    setSelectedTallerEnroll(taller);
    setEnrollForm((prev: any) => ({ ...prev, tallerId: taller.id_taller }));
    setIsOpenEnroll(true);
  };

  const handleEnrollChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEnrollForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitInscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esMenor && (!enrollForm.repNombre || !enrollForm.repCedula)) {
      toast.error("Los menores de edad requieren nombre y cédula del representante.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        tallerId: enrollForm.tallerId,
        alumno: { cedula: enrollForm.alumnoCedula, nombre: enrollForm.alumnoNombre, edad: enrollForm.alumnoEdad },
      };
      if (esMenor) {
        payload.representante = {
          nombre: enrollForm.repNombre,
          cedula: enrollForm.repCedula,
          telefono: enrollForm.repTelefono,
        };
      }
      await mavetApi.inscribirTaller(payload);
      toast.success("Alumno inscrito correctamente.");
      setEnrollForm((prev: any) => ({
        ...prev, alumnoCedula: "", alumnoNombre: "", alumnoEdad: "",
        repNombre: "", repCedula: "", repTelefono: "",
      }));
      const refreshed = await mavetApi.getInscripcionesTaller();
      setInscripciones(refreshed);
    } catch (error: any) {
      toast.error(error.message || "Error al inscribir al alumno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEnrolments = async (taller: any) => {
    setSelectedTaller(taller);
    try {
      const data = await mavetApi.getInscripcionesPorTaller(taller.id_taller);
      setTallerInscripciones(data);
    } catch {
      setTallerInscripciones([]);
    }
    setIsOpenInscr(true);
  };

  const handleDesinscribir = (inscripcion: any) => {
    setConfirm({
      open: true,
      title: "Desinscribir alumno",
      message: `¿Estás seguro de desinscribir a "${inscripcion.Alumno?.nombres || ""} ${inscripcion.Alumno?.apellidos || ""}" del taller "${inscripcion.Taller?.nombre_curso || ""}"? El registro pasará a la papelera.`,
      variant: "danger",
      confirmLabel: "Desinscribir",
      onConfirm: async () => {
        setConfirm((prev: any) => ({ ...prev, open: false }));
        try {
          await mavetApi.eliminarInscripcion(inscripcion.id_inscripcion || inscripcion.id);
          toast.success("Alumno desinscrito correctamente. Puede restaurarlo desde la Papelera.");
          const refreshed = await mavetApi.getInscripcionesTaller();
          setInscripciones(refreshed);
        } catch (error: any) {
          toast.error(error.message || "Error al desinscribir alumno.");
        }
      },
    });
  };

  const exportInscripcionesFn = async (format: "pdf" | "excel") => {
    const target = selectedTaller || selectedTallerFromParent;
    if (!target) return;
    try {
      await mavetApi.exportInscripciones(target.id_taller, format);
      toast.success(`Inscripciones exportadas en formato ${format.toUpperCase()}`);
    } catch {
      toast.error("Error al exportar inscripciones.");
    }
  };

  return {
    enrollForm, setEnrollForm,
    selectedTallerEnroll, setSelectedTallerEnroll,
    isSubmitting,
    selectedTaller,
    tallerInscripciones, setTallerInscripciones,
    edadNum, esMenor,
    isOpenEnroll: isOpenEnroll, closeEnrollModal: () => setIsOpenEnroll(false),
    openEnrollModal: () => setIsOpenEnroll(true),
    isOpenInscr: isOpenInscr, closeInscrModal: () => setIsOpenInscr(false),
    openInscrModal: () => setIsOpenInscr(true),
    openEnroll, handleEnrollChange, handleSubmitInscripcion,
    openEnrolments,
    handleDesinscribir,
    exportInscripcionesFn,
    setSelectedTaller,
  };
}
