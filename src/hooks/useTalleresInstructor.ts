import { useState } from "react";
import { mavetApi } from "../services/api";
import { normalizeCedula } from "../utils/formatters";
import toast from "react-hot-toast";

export function useTalleresInstructor(
  instructores: any[],
  setInstructores: React.Dispatch<React.SetStateAction<any[]>>,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  onInstructorCreated?: (id: number) => void,
  setFormError?: (msg: string) => void,
) {
  const [showCrearInstructor, setShowCrearInstructor] = useState(false);
  const [nuevaCedula, setNuevaCedula] = useState("");
  const [personaEncontrada, setPersonaEncontrada] = useState<any>(null);
  const [buscandoPersona, setBuscandoPersona] = useState(false);
  const [nuevaProfesion, setNuevaProfesion] = useState("");
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");

  const setError = setFormError || ((msg: string) => toast.error(msg));

  const resetForm = () => {
    setNuevaCedula("");
    setPersonaEncontrada(null);
    setNuevaProfesion("");
    setNuevaEspecialidad("");
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

  const handleBuscarPersona = async () => {
    if (!nuevaCedula.trim()) {
      setError("Ingrese una cédula para buscar");
      return;
    }
    setBuscandoPersona(true);
    try {
      const results = await mavetApi.buscarPersona(normalizeCedula(nuevaCedula));
      if (results.length === 0) {
        setError("No se encontró ninguna persona con esa cédula");
        setPersonaEncontrada(null);
      } else {
        const p = results[0];
        const yaEsInstructor = instructores.some((i) => i.id_persona === p.id_persona);
        if (yaEsInstructor) {
          setError("Esa persona ya está registrada como instructor");
          setPersonaEncontrada(null);
          return;
        }
        setPersonaEncontrada(p);
      }
    } catch {
      setError("Error al buscar la persona");
      setPersonaEncontrada(null);
    } finally {
      setBuscandoPersona(false);
    }
  };

  const handleCrearInstructor = async () => {
    if (!personaEncontrada) {
      setError("Debe buscar una persona primero");
      return;
    }
    setIsSubmitting(true);
    try {
      await mavetApi.crearInstructor({
        id_persona: personaEncontrada.id_persona,
        profesion: nuevaProfesion,
        especialidad: nuevaEspecialidad,
      });
      toast.success("Instructor creado");
      const refreshed = await mavetApi.getInstructores();
      setInstructores(refreshed);
      const nuevoInst = refreshed.find((i) => i.id_persona === personaEncontrada.id_persona);
      if (nuevoInst && onInstructorCreated) {
        onInstructorCreated(nuevoInst.id_instructor);
      }
      setShowCrearInstructor(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showCrearInstructor,
    nuevaCedula, setNuevaCedula,
    personaEncontrada,
    buscandoPersona,
    nuevaProfesion, setNuevaProfesion,
    nuevaEspecialidad, setNuevaEspecialidad,
    openCrearInstructor,
    closeCrearInstructor,
    handleBuscarPersona,
    handleCrearInstructor,
  };
}
