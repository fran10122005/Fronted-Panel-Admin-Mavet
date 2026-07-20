import { useState, useEffect } from "react";
import { mavetApi } from "../services/api";
import { normalizeCedula } from "../utils/formatters";
import toast from "react-hot-toast";

export function useTalleresInstructor(
  instructores: any[],
  setInstructores: React.Dispatch<React.SetStateAction<any[]>>,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  setConfirm: React.Dispatch<React.SetStateAction<any>>,
  onInstructorCreated?: (id: number) => void,
  setFormError?: (msg: string) => void,
) {
  const [showCrearInstructor, setShowCrearInstructor] = useState(false);
  const [nuevaCedula, setNuevaCedula] = useState("");
  const [personaEncontrada, setPersonaEncontrada] = useState<any>(null);
  const [buscandoPersona, setBuscandoPersona] = useState(false);
  const [nuevaProfesion, setNuevaProfesion] = useState("");
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [editingInstructorId, setEditingInstructorId] = useState<string | null>(null);

  const isEditingInstructor = editingInstructorId !== null;

  const [instructorNombres, setInstructorNombres] = useState("");
  const [instructorApellidos, setInstructorApellidos] = useState("");
  const [instructorTelefono, setInstructorTelefono] = useState("");
  const [instructorFechaNac, setInstructorFechaNac] = useState("");
  const [showNuevaPersonaFields, setShowNuevaPersonaFields] = useState(false);
  const [motivos, setMotivos] = useState<any[]>([]);

  useEffect(() => {
    mavetApi.obtenerMotivos().then(setMotivos).catch(() => {});
  }, []);

  const setError = (msg: string) => {
    if (setFormError) setFormError(msg);
    toast.error(msg);
  };

  const resetForm = () => {
    setNuevaCedula("");
    setPersonaEncontrada(null);
    setNuevaProfesion("");
    setNuevaEspecialidad("");
    setEditingInstructorId(null);
    setInstructorNombres("");
    setInstructorApellidos("");
    setInstructorTelefono("");
    setInstructorFechaNac("");
    setShowNuevaPersonaFields(false);
  };

  const openCrearInstructor = () => {
    if (setFormError) setFormError("");
    resetForm();
    setShowCrearInstructor(true);
  };

  const closeCrearInstructor = () => {
    if (setFormError) setFormError("");
    setShowCrearInstructor(false);
    resetForm();
  };

  const handleStartEditInstructor = (inst: any) => {
    if (setFormError) setFormError("");
    setEditingInstructorId(inst.id_instructor);
    setPersonaEncontrada({
      id_persona: inst.id_persona,
      nombres: inst.Persona?.nombres || "",
      apellidos: inst.Persona?.apellidos || "",
      cedula: inst.Persona?.cedula || "",
    });
    setNuevaProfesion(inst.profesion || "");
    setNuevaEspecialidad(inst.especialidad || "");
    setNuevaCedula(inst.Persona?.cedula || "");
  };

  const handleCancelEditInstructor = () => {
    if (setFormError) setFormError("");
    resetForm();
  };

  const handleBuscarPersona = async () => {
    if (!nuevaCedula.trim()) {
      setError("Ingrese una cédula para buscar");
      return;
    }
    setBuscandoPersona(true);
    setError("");
    try {
      const results = await mavetApi.buscarPersona(normalizeCedula(nuevaCedula));
      if (results.length === 0) {
        setShowNuevaPersonaFields(true);
        setPersonaEncontrada(null);
      } else {
        const p = results[0];
        const yaEsInstructor = instructores.some(
          (i) => i.id_persona === p.id_persona && i.id_instructor !== editingInstructorId
        );
        if (yaEsInstructor) {
          setError("Esa persona ya está registrada como instructor");
          setPersonaEncontrada(null);
          setShowNuevaPersonaFields(false);
          return;
        }
        setPersonaEncontrada(p);
        setShowNuevaPersonaFields(false);
      }
    } catch {
      setError("Error al buscar la persona");
      setPersonaEncontrada(null);
      setShowNuevaPersonaFields(false);
    } finally {
      setBuscandoPersona(false);
    }
  };

  const handleSaveInstructor = async () => {
    if (!personaEncontrada && !showNuevaPersonaFields && !showCrearInstructor) {
      setError("Debe buscar una persona primero");
      return;
    }
    setIsSubmitting(true);
    try {
      let finalIdPersona = personaEncontrada?.id_persona;
      if (!isEditingInstructor && (showNuevaPersonaFields || showCrearInstructor)) {
        if (!instructorNombres.trim() || !instructorApellidos.trim()) {
          setError("El nombre y apellido son obligatorios.");
          setIsSubmitting(false);
          return;
        }
        const motivoTaller = motivos.find(
          (m: any) => m.nombre?.toLowerCase().includes("taller") || m.descripcion?.toLowerCase().includes("taller")
        ) || motivos[0];
        const motivoId = motivoTaller ? motivoTaller.id_motivo : "MVI-00001";
        const regPayload = {
          cedula: normalizeCedula(nuevaCedula),
          nombres: instructorNombres.trim(),
          apellidos: instructorApellidos.trim(),
          telefono: instructorTelefono.trim() || undefined,
          fecha_de_nac: instructorFechaNac || undefined,
          id_motivo: motivoId,
          cantidad_acompanantes: 0,
          consentimiento_datos: true,
        };
        const regRes = await mavetApi.registrarIngreso(regPayload);
        finalIdPersona = regRes.data?.persona?.id_persona;
        if (!finalIdPersona) {
          throw new Error("No se pudo registrar a la persona en la base de datos");
        }
      }

      if (isEditingInstructor) {
        await mavetApi.actualizarInstructor(editingInstructorId, {
          id_persona: finalIdPersona,
          profesion: nuevaProfesion,
          especialidad: nuevaEspecialidad,
        });
        toast.success("Instructor actualizado");
      } else {
        await mavetApi.crearInstructor({
          id_persona: finalIdPersona,
          profesion: nuevaProfesion,
          especialidad: nuevaEspecialidad,
        });
        toast.success("Instructor creado");
      }
      const refreshed = await mavetApi.getInstructores();
      setInstructores(refreshed);

      if (!isEditingInstructor && onInstructorCreated) {
        const nuevoInst = refreshed.find((i) => i.id_persona === finalIdPersona);
        if (nuevoInst) {
          onInstructorCreated(nuevoInst.id_instructor);
        }
      }

      setShowCrearInstructor(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstructor = (id: string, nombre: string) => {
    setConfirm({
      open: true,
      title: "Eliminar instructor",
      message: `¿Está seguro de que desea eliminar a "${nombre}" como instructor?`,
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        setConfirm((prev: any) => ({ ...prev, open: false }));
        try {
          await mavetApi.eliminarInstructor(id);
          toast.success("Instructor eliminado");
          const refreshed = await mavetApi.getInstructores();
          setInstructores(refreshed);
        } catch (err: any) {
          toast.error(err.message);
        }
      },
    });
  };

  return {
    showCrearInstructor,
    nuevaCedula, setNuevaCedula,
    personaEncontrada,
    buscandoPersona,
    nuevaProfesion, setNuevaProfesion,
    nuevaEspecialidad, setNuevaEspecialidad,
    instructorNombres, setInstructorNombres,
    instructorApellidos, setInstructorApellidos,
    instructorTelefono, setInstructorTelefono,
    instructorFechaNac, setInstructorFechaNac,
    showNuevaPersonaFields,
    editingInstructorId,
    isEditingInstructor,
    openCrearInstructor,
    closeCrearInstructor,
    handleStartEditInstructor,
    handleCancelEditInstructor,
    handleBuscarPersona,
    handleSaveInstructor,
    handleDeleteInstructor,
  };
}
