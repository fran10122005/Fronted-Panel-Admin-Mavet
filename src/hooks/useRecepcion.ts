import { useState, useEffect } from "react";
import { mavetApi, axiosInstance } from "../services/api";
import { normalizeCedula } from "../utils/formatters";
import toast from "react-hot-toast";

const INGRESOS_PAGE_SIZE = 5;
const INITIAL_FORM = {
  nacionalidad: "V-",
  cedula: "",
  nombres: "",
  apellidos: "",
  fecha_nacimiento: "",
  telefono: "",
  institucion_profesion: "",
  id_motivo: "",
  cantidad_acompanantes: 0,
};
const INITIAL_MENOR = { nombres: "", apellidos: "", fecha_nacimiento: "", cedula: "" };

function getAge(dateStr: string) {
  if (!dateStr) return -1;
  const birth = new Date(dateStr);
  const today = new Date();
  return today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
}

export function useRecepcion() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isVisitaInstitucional, setIsVisitaInstitucional] = useState(false);
  const [motivos, setMotivos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [eventosHoy, setEventosHoy] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [isLoadingIngresos, setIsLoadingIngresos] = useState(false);
  const [showAllIngresos, setShowAllIngresos] = useState(false);
  const [ingresosFiltro, setIngresosFiltro] = useState<"hoy" | "mes" | "ano">("hoy");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMenorModalOpen, setIsMenorModalOpen] = useState(false);
  const [menorData, setMenorData] = useState(INITIAL_MENOR);
  const [isAsistenciaModalOpen, setIsAsistenciaModalOpen] = useState(false);

  const publicRegistrationUrl = `${window.location.origin}/registro-visitante`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicRegistrationUrl)}`;
  const age = getAge(formData.fecha_nacimiento);
  const ageMenor = getAge(menorData.fecha_nacimiento);

  useEffect(() => {
    (async () => {
      try {
        const data = await mavetApi.obtenerMotivos();
        setMotivos(data);
      } catch (error) {
        console.error("Error al cargar motivos", error);
      }
    })();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const eventos = await mavetApi.getAgendaPublica();
      const now = new Date();
      const hoyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const filtrados = eventos.filter((e: any) => {
        const fecha = e.fecha || e.fecha_uso || e.fecha_solicitada || e.start || e.date || "";
        return fecha.startsWith(hoyStr);
      });
      setEventosHoy(filtrados);
    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchIngresos = async () => {
    setIsLoadingIngresos(true);
    try {
      const now = new Date();
      let fechaStr = "";
      if (ingresosFiltro === "hoy") {
        fechaStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      } else if (ingresosFiltro === "mes") {
        fechaStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      } else if (ingresosFiltro === "ano") {
        fechaStr = `${now.getFullYear()}`;
      }
      const result = await mavetApi.getTodosIngresos(1, 1000, fechaStr);
      setIngresos(result.data || []);
    } catch {
      setIngresos([]);
    } finally {
      setIsLoadingIngresos(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchIngresos();
  }, [ingresosFiltro]);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => handleSearch(), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) return;
    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/api/personas/buscar?q=${searchQuery}`);
      const result = res.data;
      if (result.data && result.data.length > 0) {
        const seen = new Set<string>();
        const deduped = result.data.filter((p: any) => {
          const normalizedCedula = p.cedula ? p.cedula.replace(/^[VE]-/, "").trim() : "";
          const key = normalizedCedula || p.id_persona;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setSearchResults(deduped);
      } else {
        setSearchResults([]);
        toast.error("No se encontró ninguna persona. Puede registrarla ahora.");
      }
    } catch (error) {
      console.error("Error buscando persona", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPersona = (p: any) => {
    setSelectedPersona(p);
    setFormData((prev: any) => ({
      ...prev,
      nacionalidad: p.cedula ? (p.cedula.startsWith("E-") ? "E-" : "V-") : "V-",
      cedula: p.cedula ? p.cedula.replace(/^[VE]-/, "") : "",
      nombres: p.nombres || "",
      apellidos: p.apellidos || "",
      telefono: p.telefono || "",
      fecha_nacimiento: p.fecha_de_nac || "",
    }));
    setSearchResults([]);
    if (p.require_cedula_update) {
      toast.error("⚠️ Esta persona ya cumplió 9 años. Por favor, actualice su cédula real.");
    } else {
      toast.success("Persona seleccionada correctamente.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === "cedula") {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 8) value = value.slice(0, 8);
      const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setFormData({ ...formData, cedula: formatted });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setIsVisitaInstitucional(false);
    setSelectedPersona(null);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres?.trim()) { toast.error("El campo Nombres es obligatorio."); return; }
    if (!formData.apellidos?.trim()) { toast.error("El campo Apellidos es obligatorio."); return; }
    if (!formData.id_motivo) { toast.error("El motivo de visita es obligatorio."); return; }
    setIsSubmitting(true);
    try {
      let finalMotivo = "";
      let finalTaller: string | undefined;
      let finalSolicitud: string | undefined;
      if (formData.id_motivo.startsWith("evento_")) {
        const rawId = formData.id_motivo.split("_")[1];
        if (rawId.startsWith("TAL-")) {
          finalTaller = rawId;
        } else {
          finalSolicitud = rawId;
        }
        const motivoTaller = motivos.find(
          (m) => m.descripcion.toLowerCase().includes("taller") || m.descripcion.toLowerCase().includes("educa")
        );
        finalMotivo = motivoTaller ? motivoTaller.id_motivo : motivos[0]?.id_motivo || "";
      } else {
        finalMotivo = formData.id_motivo.split("_")[1];
      }
      const ingresoPayload: any = {
        cedula: formData.cedula ? `${formData.nacionalidad}${formData.cedula}` : "",
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        fecha_de_nac: formData.fecha_nacimiento,
        id_motivo: finalMotivo,
        cantidad_acompanantes: isVisitaInstitucional ? Number(formData.cantidad_acompanantes) : 0,
      };
      if (finalTaller?.startsWith("TAL-")) ingresoPayload.id_taller = finalTaller;
      if (finalSolicitud) ingresoPayload.id_solicitud = finalSolicitud;
      await mavetApi.registrarIngreso(ingresoPayload);
      toast.success("Acceso registrado exitosamente.");
      resetForm();
      fetchDashboardData();
      fetchIngresos();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar ingreso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrarMenor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const menorPayload: any = {
        nombres: menorData.nombres,
        apellidos: menorData.apellidos,
        fecha_de_nac: menorData.fecha_nacimiento,
        id_motivo: formData.id_motivo.replace("motivo_", "") || "MVI-00001",
        id_representante_persona: selectedPersona?.id_persona,
        cedula: normalizeCedula(menorData.cedula) || undefined,
      };
      await mavetApi.registrarIngreso(menorPayload);
      toast.success("Menor registrado e ingresado exitosamente.");
      setIsMenorModalOpen(false);
      setMenorData(INITIAL_MENOR);
      fetchIngresos();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar menor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIngresarMenorAsociado = async (menor: any) => {
    if (!selectedPersona) return;
    setIsSubmitting(true);
    try {
      const edad = getAge(menor.fecha_de_nac);
      if (edad >= 12) {
        toast.error(`${menor.nombres} tiene ${edad} años. Debe registrarse como visitante regular.`);
        return;
      }
      const payload: any = {
        nombres: menor.nombres,
        apellidos: menor.apellidos,
        fecha_de_nac: menor.fecha_de_nac,
        cedula: normalizeCedula(menor.cedula) || undefined,
        id_motivo: formData.id_motivo.replace("motivo_", "") || "MVI-00001",
        id_representante_persona: selectedPersona.id_persona,
      };
      await mavetApi.registrarIngreso(payload);
      toast.success(`${menor.nombres} ingresado exitosamente.`);
      fetchIngresos();
    } catch (error: any) {
      toast.error(error.message || `Error al ingresar a ${menor.nombres}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    selectedPersona, setSelectedPersona,
    formData, setFormData,
    isVisitaInstitucional, setIsVisitaInstitucional,
    motivos,
    isSubmitting,
    isSearching,
    eventosHoy,
    isLoadingDashboard,
    ingresos,
    isLoadingIngresos,
    showAllIngresos, setShowAllIngresos,
    ingresosFiltro, setIngresosFiltro,
    isQrModalOpen, setIsQrModalOpen,
    isMenorModalOpen, setIsMenorModalOpen,
    menorData, setMenorData,
    isAsistenciaModalOpen, setIsAsistenciaModalOpen,
    age, ageMenor,
    publicRegistrationUrl,
    qrImageUrl,
    INGRESOS_PAGE_SIZE,
    handleSearch, selectPersona, handleChange, handleSubmit,
    handleRegistrarMenor, handleIngresarMenorAsociado,
    fetchDashboardData, fetchIngresos, resetForm,
  };
}
