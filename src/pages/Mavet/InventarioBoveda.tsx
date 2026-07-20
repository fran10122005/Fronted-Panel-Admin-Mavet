import { useState, useEffect, useMemo, useRef } from "react";
import { mavetApi } from "../../services/api";
import { exportarInventarioObras } from "../../services/pdf.service";
import { Artista, Obra } from "../../types";
import { AlertCircle } from "lucide-react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/Badge";
import { useModal } from "../../hooks/useModal";
import { generateNextCode } from "../../utils/codeGenerator";
import { limitNumericInput, validateEmail, validatePhone } from "../../utils/validation";
import Pagination from "../../components/ui/Pagination";
import HistorialObraModal from "../../components/ui/HistorialObraModal";
import ObraDetailModal from "./inventario/ObraDetailModal";
import toast from "react-hot-toast";
import { useAuth, getUserRole } from "../../context/AuthContext";

const initialFormState: Partial<Obra> & { id_artista?: number, id_tecnica?: number, id_estado_actual?: number, id_categoria_obra?: number, ancho?: number, largo?: number } = {
  id: "",
  codigo_inventario: "",
  titulo: "",
  ancho: undefined,
  largo: undefined,
  ano: new Date().getFullYear(),
  id_categoria_obra: undefined,
  tipo_ingreso: "",
  piezas: 1,
  peso: undefined,
  descripcion: "",
  ubicacion: "",
  clasificacion_patrimonial: "no_clasificado",
};

export default function InventarioBoveda() {
  const { user } = useAuth();
  const userRole = getUserRole(user);

  const canEditObra = userRole === "Administrador" || userRole === "admin" || userRole === "Curador" || userRole === "Restaurador";
  const canDeleteObra = userRole === "Administrador" || userRole === "admin";

  const previewUrlRef = useRef<string | null>(null);
  const artistDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (artistDropdownRef.current && !artistDropdownRef.current.contains(e.target as Node)) {
        setArtistDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [obras, setObras] = useState<Obra[]>([]);
  const [artistas, setArtistas] = useState<any[]>([]);
  const [tecnicas, setTecnicas] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterCodigo, setFilterCodigo] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => prev?.key === key && prev.direction === "asc" ? { key, direction: "desc" } : { key, direction: "asc" });
  };

  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<any>(initialFormState);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState<string | null>(null);
  const [customTecnica, setCustomTecnica] = useState("");

  const [customCategoria, setCustomCategoria] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedObraForDetail, setSelectedObraForDetail] = useState<Obra | null>(null);
  const [selectedObraForHistorial, setSelectedObraForHistorial] = useState<Obra | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; variant?: "danger" | "warning" | "info" }>({
    open: false, title: "", message: "", onConfirm: () => {}, variant: "danger",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 20;

  const fetchObrasPaginated = async (page: number) => {
    const result = await mavetApi.getObras(page, ITEMS_PER_PAGE);
    if (result.data.length === 0 && page > 1) {
      return fetchObrasPaginated(page - 1);
    }
    setObras(result.data);
    setCurrentPage(result.currentPage);
    setTotalPages(result.totalPages);
    setTotalItems(result.totalItems);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setIsLoading(true);
    fetchObrasPaginated(page).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const fetchDatos = async () => {
      setIsLoading(true);
      try {
        const artData = await mavetApi.getArtistas().catch(e => { console.error("Error Artistas:", e); return []; });
        setArtistas(artData);
        setArtistsList(artData);

        const tecData = await mavetApi.getTecnicas().catch(e => { console.error("Error Tecnicas:", e); return []; });
        setTecnicas(tecData);

        const estData = await mavetApi.getEstadosObra().catch(e => { console.error("Error Estados:", e); return []; });
        setEstados(estData);

        const catData = await mavetApi.getCategoriasObra().catch(e => { console.error("Error Categorias:", e); return []; });
        setCategorias(catData);

        const espData = await mavetApi.getEspaciosMuseo().catch(e => { console.error("Error Espacios:", e); return []; });
        setEspacios(Array.isArray(espData) ? espData : []);

        await fetchObrasPaginated(1);
      } catch (error) {
        console.error("Error general al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDatos();
  }, []);

  const handleOpenAdd = async () => {
    const all = await mavetApi.getObras();
    const nextCode = generateNextCode(
      all.data.map(o => o.codigo_inventario),
      "MVT",
      3
    );
    setFormData({ ...initialFormState, codigo_inventario: nextCode });
    setArtistInput("");
    setImagenFile(null);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImagenPreviewUrl(null);
    setCustomTecnica("");
    setCustomCategoria("");
    setFormErrors({});
    setIsEditing(false);
    openModal();
  };

  const parseMedidas = (medidas?: string) => {
    if (!medidas) return { ancho: undefined, largo: undefined };
    const parts = medidas.split(/[xX×]/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return parts.length >= 2 ? { ancho: parts[0], largo: parts[1] } : { ancho: undefined, largo: undefined };
  };

  const handleEdit = (obra: Obra) => {
    setFormData((prev: typeof initialFormState) => ({ ...prev, ...obra, ...parseMedidas(obra.medidas), medidas: undefined }));
    setArtistInput(obra.autor || "");
    setImagenFile(null);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImagenPreviewUrl(null);
    setCustomTecnica("");
    setCustomCategoria("");
    setFormErrors({});
    setIsEditing(true);
    openModal();
  };

  const handleDelete = (id: string) => {
    setConfirm({
      open: true,
      title: "Eliminar obra",
      message: "¿Está seguro de que desea eliminar esta obra del inventario?",
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, open: false }));
        try {
          setIsLoading(true);
          await mavetApi.eliminarObra(id);
          await fetchObrasPaginated(currentPage);
          toast.success("Obra eliminada exitosamente");
        } catch (error: any) {
          toast.error(error.message || "Error al eliminar obra");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const selectedCategoryName = useMemo(() => {
    if (!formData.id_categoria_obra) return null;
    const cat = categorias.find((c: any) => c.id_categoria_obra === formData.id_categoria_obra);
    return cat?.nombre_categoria || null;
  }, [formData.id_categoria_obra, categorias]);

  const isPintura = selectedCategoryName?.toLowerCase() === 'pintura';

  const validateObraField = (name: string, value: any, _allData?: any): string => {
    if (["titulo", "ubicacion", "id_estado_actual", "tipo_ingreso"].includes(name) && (!value || !String(value).trim())) {
      const labels: Record<string, string> = { titulo: "El título", ubicacion: "La ubicación", id_estado_actual: "El estado", tipo_ingreso: "El tipo de ingreso" };
      return `${labels[name] || "Este campo"} es obligatorio.`;
    }
    if (name === "id_artista" && (value == null || value === "")) return "Debe seleccionar un autor/artista.";
    if (name === "id_categoria_obra" && (!value || value === "")) return "Seleccione una categoría.";
    if (name === "id_tecnica" && (!value || value === "")) return "Seleccione una técnica.";
    if (name === "ano") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 1000 || num > new Date().getFullYear() + 5)
        return `Año inválido (1000-${new Date().getFullYear() + 5}).`;
    }
    if (name === "piezas") {
      const num = Number(value);
      if (!value || isNaN(num) || num < 1) return "Debe ser al menos 1 pieza.";
    }
    if (name === "ancho") {
      if (value === "" || value === undefined || value === null) return "";
      const num = Number(value);
      if (isNaN(num) || num <= 0) return "El ancho debe ser un número positivo.";
      if (num > 1000) return "El ancho no puede superar los 1000 cm.";
    }
    if (name === "largo") {
      if (value === "" || value === undefined || value === null) return "";
      const num = Number(value);
      if (isNaN(num) || num <= 0) return "El largo debe ser un número positivo.";
      if (num > 1000) return "El largo no puede superar los 1000 cm.";
    }
    if (name === "peso" && value !== undefined && value !== "" && value !== null) {
      const num = Number(value);
      if (isNaN(num) || num < 0) return "El peso debe ser un número válido.";
      if (num > 300) return "El peso no puede superar los 300 kg.";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: any) => {
      const newData = { ...prev, [name]: value === "" ? undefined : value };
      
      if (name === "id_categoria_obra" && value) {
        const newCat = categorias.find((c: any) => c.id_categoria_obra === value);
        if (newCat && newCat.nombre_categoria?.toLowerCase() !== 'pintura') {
          delete newData.id_tecnica;
        }
      }
      
      return newData;
    });

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      const err = validateObraField(name, value, formData);
      if (err) next[name] = err;
      return next;
    });
    
    if (name === "id_tecnica" && value !== "other") {
      setCustomTecnica("");
    }

    if (name === "id_categoria_obra" && value !== "other") {
      setCustomCategoria("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    const isOtherTecnica = String(formData.id_tecnica) === "other";
    const isOtherCategoria = String(formData.id_categoria_obra) === "other";

    const fieldsToCheck = ["titulo", "id_artista", "id_estado_actual", "id_categoria_obra", "tipo_ingreso", "ubicacion", "ano", "piezas", "ancho", "largo", "peso"];
    const errors: Record<string, string> = {};
    for (const f of fieldsToCheck) {
      const err = validateObraField(f, formData[f], formData);
      if (err) errors[f] = err;
    }
    if (isOtherCategoria && !customCategoria.trim()) errors.customCategoria = "Especifique la categoría";
    if (isPintura && !formData.id_tecnica && !isOtherTecnica) errors.id_tecnica = "Seleccione una técnica";
    if (isPintura && isOtherTecnica && !customTecnica.trim()) errors.customTecnica = "Especifique la técnica";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      const artistaId = formData.id_artista;
      let tecnicaId = formData.id_tecnica;
      const estadoId = formData.id_estado_actual;
      let categoriaId = formData.id_categoria_obra;

      if (isOtherTecnica) {
        const nuevaTecnica = await mavetApi.crearTecnica({ nombre_tecnica: customTecnica.trim() });
        tecnicaId = nuevaTecnica.id_tecnica ?? nuevaTecnica.id;
        const tecData = await mavetApi.getTecnicas();
        setTecnicas(tecData);
      }

      if (isOtherCategoria) {
        const nuevaCategoria = await mavetApi.crearCategoria({ nombre_categoria: customCategoria.trim() });
        categoriaId = nuevaCategoria.id_categoria_obra ?? nuevaCategoria.id;
        const catData = await mavetApi.getCategoriasObra();
        setCategorias(catData);
      }

      const { id: _omitId, ubicacion, ano, ancho, largo, clasificacion_patrimonial: _cp, ...restForm } = formData;
      const medidasStr = formData.ancho && formData.largo ? `${Number(formData.ancho)}x${Number(formData.largo)}` : undefined;
      const payloadBase = {
        ...restForm,
        medidas: medidasStr,
        clasificacion_patrimonial: _cp || 'no_clasificado',
        ubicacion_actual: ubicacion,
        anio: ano !== undefined && ano !== "" ? parseInt(ano.toString(), 10) : null,
        id_artista: artistaId,
        id_tecnica: tecnicaId,
        id_estado_actual: estadoId,
        id_categoria_obra: categoriaId,
        piezas: formData.piezas !== undefined && formData.piezas !== "" ? parseInt(formData.piezas.toString(), 10) : 1,
        peso: formData.peso !== undefined && formData.peso !== "" && formData.peso !== null ? parseFloat(formData.peso.toString()) : null,
      };

      const cleanPayload: any = {};
      Object.keys(payloadBase).forEach(key => {
        const value = (payloadBase as any)[key];
        if (value !== null && value !== undefined && value !== "") {
          cleanPayload[key] = value;
        }
      });

      let dataToSend: any = cleanPayload;

      if (imagenFile) {
        dataToSend = new FormData();
        Object.keys(cleanPayload).forEach(key => {
          dataToSend.append(key, cleanPayload[key]);
        });
        dataToSend.append("imagen", imagenFile);
      }

      if (isEditing) {
        await mavetApi.actualizarObra(formData.id, dataToSend);
        toast.success("Obra actualizada exitosamente");
      } else {
        await mavetApi.crearObra(dataToSend);
        toast.success("Obra registrada exitosamente");
      }
      await fetchObrasPaginated(1);
      closeModal();
    } catch (error: any) {
      console.error("Error al guardar obra:", error);
      toast.error(error.message || "Error al guardar obra");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // === Gestión de artistas (inventario directo en página) ===
  const [artistsList, setArtistsList] = useState<Artista[]>([]);
  const [artistSearch, setArtistSearch] = useState("");
  const [artistFormOpen, setArtistFormOpen] = useState(false);
  const [artistFormData, setArtistFormData] = useState<any>({ nombres: "", apellidos: "", ci: "", fecha_nacimiento: "", telefono: "", correo: "", direccion: "", nacionalidad: "" });
  const [artistSearchQuery, setArtistSearchQuery] = useState("");
  const [artistSearchResults, setArtistSearchResults] = useState<Artista[]>([]);
  const [isSearchingArtist, setIsSearchingArtist] = useState(false);
  const [isEditingArtist, setIsEditingArtist] = useState(false);
  const [isArtistPreloaded, setIsArtistPreloaded] = useState(false);
  const [isArtistSubmitting, setIsArtistSubmitting] = useState(false);
  const [artistFieldErrors, setArtistFieldErrors] = useState<Record<string, string>>({});
  const [artistInput, setArtistInput] = useState("");
  const [artistDropdownOpen, setArtistDropdownOpen] = useState(false);

  const parseCedula = (value: string) => {
    let raw = (value || "").trim().toUpperCase();
    let prefix = "";
    if (raw.startsWith("V-") || raw.startsWith("E-")) {
      prefix = raw.substring(0, 1);
      raw = raw.substring(2);
    } else if (raw.startsWith("V") || raw.startsWith("E")) {
      prefix = raw.substring(0, 1);
      raw = raw.substring(1);
    }
    const digits = raw.replace(/\D/g, "");
    return { prefix, digits };
  };

  const normalizeCedula = (value: string) => {
    const { prefix, digits } = parseCedula(value);
    if (!digits) return value;
    return prefix ? `${prefix}-${digits}` : digits;
  };

  const validateCedula = (value: string): string => {
    if (!value || !value.trim()) return "";
    const { prefix, digits } = parseCedula(value);
    if (!digits) return "Formato de cédula inválido.";
    if (prefix === "V" && digits.length > 8) return "La cédula venezolana no puede tener más de 8 dígitos.";
    if (digits.length > 11) return "La cédula no puede tener más de 11 dígitos.";
    return "";
  };

  const validateArtistField = (field: string, value: string, _allData?: any) => {
    let error = "";
    const trimmed = (value || "").trim();

    switch (field) {
      case "nombres":
        if (!trimmed) error = "El nombre del artista es obligatorio.";
        break;
      case "apellidos":
        break;
      case "ci":
        if (trimmed) error = validateCedula(trimmed);
        break;
      case "correo":
        if (trimmed) {
          const emailErr = validateEmail(trimmed, "El correo");
          if (emailErr) error = emailErr;
        }
        break;
      case "telefono":
        if (trimmed) {
          const phoneErr = validatePhone(trimmed, "El teléfono");
          if (phoneErr) error = phoneErr;
        }
        break;
      case "fecha_nacimiento":
        if (trimmed) {
          const birthDate = new Date(trimmed + "T00:00:00");
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (birthDate > today) {
            error = "La fecha de nacimiento no puede ser futura.";
          } else {
            const ageMs = today.getTime() - birthDate.getTime();
            const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
            if (ageYears < 4) {
              error = "La edad debe ser de al menos 4 años.";
            } else if (ageYears > 150) {
              error = "La edad no puede superar los 150 años.";
            }
          }
        }
        break;
    }

    return error;
  };

  const birthMinDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 150);
    return d.toISOString().split("T")[0];
  }, []);

  const birthMaxDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 4);
    return d.toISOString().split("T")[0];
  }, []);

  const fetchArtistsList = async () => {
    const data = await mavetApi.getArtistas().catch(() => []);
    setArtistsList(data);
    setArtistas(data);
  };

  const handleArtistSearch = async () => {
    const q = artistSearchQuery.trim();
    if (!q || q.length < 2) return;
    setIsSearchingArtist(true);
    try {
      const localResults = artistsList.filter(a =>
        a.ci && a.ci.toLowerCase().includes(q.toLowerCase())
      );
      if (localResults.length > 0) {
        setArtistSearchResults(localResults);
        return;
      }
      const apiResults = await mavetApi.buscarArtista(q);
      if (apiResults.length > 0) {
        setArtistSearchResults(apiResults);
        return;
      }
      const personaResults = await mavetApi.buscarPersona(q);
      if (personaResults.length > 0) {
        setArtistSearchResults(personaResults.map((p: any) => ({
          id_artista: 0,
          nombres: p.nombres || "",
          apellidos: p.apellidos || "",
          ci: p.cedula || "",
          fecha_nacimiento: p.fecha_de_nac || "",
          telefono: p.telefono || "",
          correo: p.correo || "",
          direccion: p.direccion || "",
          nacionalidad: "",
        })));
        return;
      }
      setArtistSearchResults([]);
      toast.error("No se encontró ninguna persona con ese dato.");
    } catch {
      setArtistSearchResults([]);
    } finally {
      setIsSearchingArtist(false);
    }
  };

  const selectArtistSearchResult = (result: Artista) => {
    setArtistFormData(result);
    setIsEditingArtist(!!result.id_artista);
    setIsArtistPreloaded(true);
    setArtistSearchResults([]);
    setArtistSearchQuery("");
  };

  const handleArtistFormOpen = (artista?: Artista) => {
    setArtistSearchResults([]);
    setArtistSearchQuery("");
    setIsArtistPreloaded(false);
    setArtistFieldErrors({});
    if (artista) {
      setArtistFormData(artista);
      setIsEditingArtist(true);
    } else {
      setArtistFormData({ nombres: "", apellidos: "", ci: "", fecha_nacimiento: "", telefono: "", correo: "", direccion: "", nacionalidad: "" });
      setIsEditingArtist(false);
    }
    setArtistFormOpen(true);
  };

  const handleArtistDelete = (id: number) => {
    setConfirm({
      open: true,
      title: "Eliminar artista",
      message: "¿Está seguro de que desea eliminar este artista?",
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, open: false }));
        try {
          await mavetApi.eliminarArtista(id);
          await fetchArtistsList();
          toast.success("Artista eliminado");
        } catch (error: any) {
          toast.error(error.message || "Error al eliminar artista");
        }
      },
    });
  };

  const handleArtistSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsToCheck = ["nombres", "ci", "correo", "fecha_nacimiento"];
    const newErrors: Record<string, string> = {};
    for (const f of fieldsToCheck) {
      const err = validateArtistField(f, artistFormData[f] || "", artistFormData);
      if (err) newErrors[f] = err;
    }
    setArtistFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Corrige los errores en el formulario antes de guardar.");
      return;
    }
    const payload = { ...artistFormData };
    if (payload.ci) payload.ci = normalizeCedula(payload.ci);
    setIsArtistSubmitting(true);
    try {
      if (isEditingArtist) {
        await mavetApi.actualizarArtista(payload.id_artista, payload);
        toast.success("Artista actualizado");
      } else {
        const result = await mavetApi.crearArtista(payload);
        if (result.data) {
          setFormData((prev: any) => ({
            ...prev,
            id_artista: result.data.id_artista,
            autor: `${result.data.nombres || ""} ${result.data.apellidos || ""}`.trim(),
          }));
          setArtistInput(`${result.data.nombres || ""} ${result.data.apellidos || ""}`.trim());
        }
        toast.success("Artista registrado");
      }
      await fetchArtistsList();
      setArtistFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar artista");
    } finally {
      setIsArtistSubmitting(false);
    }
  };

  const filteredArtistsList = useMemo(() => {
    if (!artistSearch) return artistsList;
    const t = artistSearch.toLowerCase();
    return artistsList.filter(a =>
      a.nombres.toLowerCase().includes(t) ||
      a.apellidos.toLowerCase().includes(t) ||
      (a.ci && a.ci.toLowerCase().includes(t))
    );
  }, [artistsList, artistSearch]);

  const sortKey = sortConfig ? `${sortConfig.key}_${sortConfig.direction}` : "";

  const filteredObras = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    const cod = (filterCodigo || "").toLowerCase();

    const result = obras.filter((obra) => {
      const titulo = (obra.titulo || "").toLowerCase();
      const obraId = (obra.id || "").toLowerCase();
      const codigo = (obra.codigo_inventario || "").toLowerCase();
      const autor = (obra.autor || "").toLowerCase();

      const matchesSearch = !q || titulo.includes(q) || obraId.includes(q) || codigo.includes(q) || autor.includes(q);
      const matchesEstado = filterEstado === "Todos" || obra.estado === filterEstado;
      const matchesCodigo = !cod || codigo.includes(cod) || obraId.includes(cod);

      return matchesSearch && matchesEstado && matchesCodigo;
    });
    if (!sortConfig) return result;
    return [...result].sort((a: any, b: any) => {
      if (sortConfig.key === "codigo_inventario") {
        const getNum = (obra: any) => {
          const raw = String(obra.codigo_inventario || obra.id || "");
          const n = parseInt(raw.replace(/\D/g, ""), 10);
          return isNaN(n) ? 0 : n;
        };
        return sortConfig.direction === "asc"
          ? getNum(a) - getNum(b)
          : getNum(b) - getNum(a);
      }
      const aVal = (a[sortConfig.key] ?? "").toString().toLowerCase();
      const bVal = (b[sortConfig.key] ?? "").toString().toLowerCase();
      return sortConfig.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [obras, searchTerm, filterEstado, filterCodigo, sortKey]);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario de Bóveda</h1>
          <p className="text-sm text-gray-500">Catálogo de obras de arte registradas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" data-tour="exportar-pdf"
            onClick={() => { if (obras.length === 0) return; exportarInventarioObras(filteredObras); }}
            startIcon={<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          {canEditObra && (
            <Button size="sm" data-tour="agregar-nueva-obra" onClick={handleOpenAdd}
              startIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}>
              <span className="hidden sm:inline">Agregar Nueva Obra</span>
              <span className="sm:hidden">Nueva Obra</span>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              data-tour="buscador-obras"
              type="text"
              placeholder="Buscar por código, título o autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">ID:</span>
            <input
              type="text"
              placeholder="MVT-001"
              value={filterCodigo}
              onChange={(e) => setFilterCodigo(e.target.value)}
              className="w-full sm:w-[130px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200 dark:text-white/90 placeholder:text-gray-400"
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Estado:</span>
            <select
              data-tour="filtro-estado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200 dark:text-white/90"
            >
              <option value="Todos">Todos</option>
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Restauración">En Restauración</option>
            </select>
            <select
              value={sortConfig ? `${sortConfig.key}_${sortConfig.direction}` : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) { setSortConfig(null); return; }
                const [key, direction] = val.split("_");
                setSortConfig({ key, direction: direction as "asc" | "desc" });
              }}
              className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200 dark:text-white/90"
            >
              <option value="">Ord. predet.</option>
              <option value="codigo_inventario_asc">ID ↑</option>
              <option value="codigo_inventario_desc">ID ↓</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSkeleton variant="table" rows={8} cols={6} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-2.5" onClick={() => handleSort("codigo_inventario")} style={{cursor: 'pointer'}}>
                      Código {sortConfig?.key === "codigo_inventario" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="px-2 py-2.5">Título</th>
                    <th className="px-2 py-2.5">Autor</th>
                    <th className="px-2 py-2.5">Categoría</th>
                    <th className="px-2 py-2.5">Ubicación</th>
                    <th className="px-2 py-2.5 text-center">Estado</th>
                    <th className="px-2 py-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredObras.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                        <svg className="mx-auto h-10 w-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-sm font-medium">No se encontraron resultados</p>
                        <p className="text-xs mt-1">Prueba ajustando tu búsqueda o filtros.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredObras.map((obra) => (
                      <tr 
                        key={obra.id} 
                        onClick={() => setSelectedObraForDetail(obra)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                      >
                        <td className="px-2 py-2.5 font-mono text-xs text-brand-600 dark:text-brand-400 font-medium">{obra.codigo_inventario || obra.id}</td>
                        <td className="px-2 py-2.5 font-semibold text-sm">{obra.titulo}</td>
                        <td className="px-2 py-2.5 text-xs text-gray-700 dark:text-gray-300">{obra.autor}</td>
                        <td className="px-2 py-2.5">
                          <Badge scheme="info">{obra.categoria || '—'}</Badge>
                        </td>
                        <td className="px-2 py-2.5 text-xs text-gray-500 dark:text-gray-400">{obra.ubicacion}</td>
                        <td className="px-2 py-2.5 text-center">
                          <Badge scheme={obra.estado === 'Excelente' ? 'success' : obra.estado === 'Bueno' ? 'info' : 'warning'} dot>
                            {obra.estado}
                          </Badge>
                        </td>
                        <td className="px-2 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {canEditObra && (
                              <Button variant="ghost" size="xs" onClick={() => handleEdit(obra)} title="Editar"
                                className="text-gray-500 hover:text-brand-600"
                                startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}>Editar</Button>
                            )}
                            {canDeleteObra && (
                              <Button variant="ghost" size="xs" onClick={() => handleDelete(obra.id)} title="Eliminar"
                                className="text-gray-500 hover:text-red-600"
                                startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}>Eliminar</Button>
                            )}
                            {!canEditObra && !canDeleteObra && (
                              <span className="text-xs text-gray-400 italic font-semibold">Solo Lectura</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={ITEMS_PER_PAGE}
                label="obras"
                onPageChange={goToPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Inventario de Artistas */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Artistas</h2>
            <span className="text-xs text-gray-500">({artistsList.length} registrados)</span>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Buscar artista..."
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
              className="pl-9 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="px-2 py-2.5">Nombres</th>
                <th className="px-2 py-2.5">Apellidos</th>
                <th className="px-2 py-2.5">Cédula</th>
                <th className="px-2 py-2.5">Teléfono</th>
                <th className="px-2 py-2.5">Nacionalidad</th>
                <th className="px-2 py-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
              {filteredArtistsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <p className="text-sm font-medium">No hay artistas registrados.</p>
                  </td>
                </tr>
              ) : (
                filteredArtistsList.map((a) => (
                  <tr key={a.id_artista} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-2 py-2.5 font-semibold text-sm">{a.nombres}</td>
                    <td className="px-2 py-2.5 text-xs text-gray-700 dark:text-gray-300">{a.apellidos}</td>
                    <td className="px-2 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">{a.ci || '—'}</td>
                    <td className="px-2 py-2.5 text-xs">{a.telefono || '—'}</td>
                    <td className="px-2 py-2.5">
                      {a.nacionalidad ? (
                        <Badge scheme="info">{a.nacionalidad}</Badge>
                      ) : '—'}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canEditObra && (
                          <Button variant="ghost" size="xs" onClick={() => handleArtistFormOpen(a)} title="Editar"
                            className="text-gray-500 hover:text-brand-600"
                            startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}>Editar</Button>
                        )}
                        {canDeleteObra && (
                          <Button variant="ghost" size="xs" onClick={() => handleArtistDelete(a.id_artista)} title="Eliminar"
                            className="text-gray-500 hover:text-red-600"
                            startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}>Eliminar</Button>
                        )}
                        {!canEditObra && !canDeleteObra && (
                          <span className="text-xs text-gray-400 italic font-semibold">Solo Lectura</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulario Administrativo */}
      <Modal isOpen={isOpen} onClose={() => { closeModal(); setFormErrors({}); }} className="max-w-[620px] p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {isEditing ? `Editar Obra: ${formData.id}` : "Registrar Nueva Obra"}
          </h3>
          
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Código / Serial</label>
                <input
                  type="text"
                  name="codigo_inventario"
                  value={formData.codigo_inventario || ""}
                  readOnly
                  tabIndex={-1}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.titulo
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                />
                {formErrors.titulo && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.titulo}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Autor / Artista</label>
                <div className="relative" ref={artistDropdownRef}>
                  <input
                    type="text"
                    placeholder="Buscar o escribir nombre del artista..."
                    value={artistInput}
                    onChange={(e) => {
                      setArtistInput(e.target.value);
                      setArtistDropdownOpen(true);
                      if (!e.target.value.trim()) {
                        setFormData((prev: any) => ({ ...prev, id_artista: undefined, autor: undefined }));
                      }
                    }}
                    onFocus={() => setArtistDropdownOpen(true)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                      formErrors.id_artista
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                    }`}
                    required
                  />
                  {artistDropdownOpen && (() => {
                    const query = artistInput.trim().toLowerCase();
                    const filtered = query
                      ? artistas.filter((a: any) => {
                          const fullName = `${a.nombres || ""} ${a.apellidos || ""}`.trim().toLowerCase();
                          return fullName.includes(query) || (a.ci && a.ci.includes(query));
                        })
                      : artistas;
                    if (filtered.length === 0 && query.length >= 2) {
                      return (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">Sin coincidencias</div>
                          <div
                            onClick={() => {
                              const [nombres, ...apellidosArr] = query.split(" ");
                              setArtistFormData({
                                nombres: nombres || "",
                                apellidos: apellidosArr.join(" ") || "",
                                ci: "", fecha_nacimiento: "", telefono: "", correo: "", direccion: "", nacionalidad: "",
                              });
                              setIsEditingArtist(false);
                              setIsArtistPreloaded(false);
                              setArtistFieldErrors({});
                              setArtistSearchResults([]);
                              setArtistSearchQuery("");
                              setArtistFormOpen(true);
                              setArtistDropdownOpen(false);
                            }}
                            className="px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 cursor-pointer flex items-center gap-2 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Agregar &quot;{query}&quot;
                          </div>
                        </div>
                      );
                    }
                    if (filtered.length === 0) return null;
                    return (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filtered.map((a: any) => (
                          <div
                            key={a.id_artista}
                            onClick={() => {
                              setFormData((prev: any) => ({
                                ...prev,
                                id_artista: a.id_artista,
                                autor: `${a.nombres || ""} ${a.apellidos || ""}`.trim(),
                              }));
                              setArtistInput(`${a.nombres || ""} ${a.apellidos || ""}`.trim());
                              setArtistDropdownOpen(false);
                              setFormErrors((prev) => { const n = { ...prev }; delete n.id_artista; return n; });
                            }}
                            className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                          >
                            <span className="text-gray-800 dark:text-white">{a.nombres} {a.apellidos}</span>
                            {a.ci && <span className="text-[11px] text-gray-400">{a.ci}</span>}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                {formErrors.id_artista && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.id_artista}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Medidas</label>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      name="ancho"
                      placeholder="Ancho"
                      min={1}
                      max={1000}
                      value={formData.ancho ?? ""}
                      onChange={handleChange}
                      className={`w-full rounded-lg border pl-3 pr-8 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                        formErrors.ancho
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                      }`}
                      required
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 dark:text-gray-500 pointer-events-none">cm</span>
                  </div>
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500 px-0.5 select-none">x</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      name="largo"
                      placeholder="Largo"
                      min={1}
                      max={1000}
                      value={formData.largo ?? ""}
                      onChange={handleChange}
                      className={`w-full rounded-lg border pl-3 pr-8 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                        formErrors.largo
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                      }`}
                      required
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 dark:text-gray-500 pointer-events-none">cm</span>
                  </div>
                </div>
                {(formErrors.ancho || formErrors.largo) && (
                  <p className="text-red-500 text-[11px] mt-0.5">{formErrors.ancho || formErrors.largo}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Año</label>
                <input
                  type="number"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  onKeyDown={limitNumericInput}
                  min={1000}
                  max={new Date().getFullYear() + 5}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.ano
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                />
                {formErrors.ano && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.ano}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Estado de Conservación</label>
                <select
                  name="id_estado_actual"
                  value={formData.id_estado_actual || ""}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.id_estado_actual
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                >
                  <option value="" disabled>Seleccione un estado...</option>
                  {estados.map((e: any) => (
                    <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
                  ))}
                </select>
                {formErrors.id_estado_actual && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.id_estado_actual}</p>}
              </div>
            </div>

            <div className={`grid grid-cols-1 gap-3 items-start ${isPintura ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Categoría / Modalidad</label>
                {String(formData.id_categoria_obra) === "other" ? (
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={customCategoria}
                      onChange={(e) => setCustomCategoria(e.target.value)}
                      placeholder="Especifique la categoría..."
                      className={`flex-1 min-w-0 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                        formErrors.customCategoria
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev: any) => ({ ...prev, id_categoria_obra: undefined }));
                        setCustomCategoria("");
                      }}
                      className="whitespace-nowrap text-[11px] text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium pt-[9px]"
                    >
                      &larr; Volver
                    </button>
                  </div>
                ) : (
                  <select
                    name="id_categoria_obra"
                    value={formData.id_categoria_obra || ""}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                      formErrors.id_categoria_obra
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                    }`}
                    required
                  >
                    <option value="" disabled>Seleccione una categoría...</option>
                    {categorias.map((c: any) => (
                      <option key={c.id_categoria_obra} value={c.id_categoria_obra}>{c.nombre_categoria}</option>
                    ))}
                    <option value="other">Otra (especificar)...</option>
                  </select>
                )}
                {formErrors.id_categoria_obra && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.id_categoria_obra}</p>}
                {formErrors.customCategoria && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.customCategoria}</p>}
              </div>
              {isPintura && (
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Técnica</label>
                  {String(formData.id_tecnica) === "other" ? (
                    <div className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={customTecnica}
                        onChange={(e) => setCustomTecnica(e.target.value)}
                        placeholder="Especifique la técnica..."
                        className={`flex-1 min-w-0 rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                          formErrors.customTecnica
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, id_tecnica: undefined }));
                          setCustomTecnica("");
                        }}
                        className="whitespace-nowrap text-[11px] text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium pt-[9px]"
                      >
                        &larr; Volver
                      </button>
                    </div>
                  ) : (
                    <select
                      name="id_tecnica"
                      value={formData.id_tecnica || ""}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                        formErrors.id_tecnica
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                      }`}
                      required
                    >
                      <option value="" disabled>Seleccione una técnica...</option>
                      {tecnicas.map((t: any) => (
                        <option key={t.id_tecnica} value={t.id_tecnica}>{t.nombre_tecnica}</option>
                      ))}
                      <option value="other">Otra (especificar)...</option>
                    </select>
                  )}
                  {formErrors.id_tecnica && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.id_tecnica}</p>}
                  {formErrors.customTecnica && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.customTecnica}</p>}
                </div>
              )}
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Ubicación</label>
                <select
                  name="ubicacion"
                  value={formData.ubicacion || ""}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.ubicacion
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                >
                  <option value="" disabled>Seleccione una ubicación...</option>
                  {espacios.filter((e: any) => (e.nombre_espacio || "").toLowerCase() !== "auditorio").map((e: any) => (
                    <option key={e.id_espacio} value={e.nombre_espacio}>
                      {e.nombre_espacio}
                    </option>
                  ))}
                </select>
                {formErrors.ubicacion && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.ubicacion}</p>}
              </div>
            </div>

            {/* Fila: Cantidad de piezas, Tipo de ingreso, Peso */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Cantidad de Piezas</label>
                <input
                  type="number"
                  name="piezas"
                  min={1}
                  value={formData.piezas ?? 1}
                  onChange={handleChange}
                  onKeyDown={limitNumericInput}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.piezas
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                />
                {formErrors.piezas && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.piezas}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Peso (kg)</label>
                <input
                  type="number"
                  name="peso"
                  step="0.01"
                  min={0}
                  max={300}
                  value={formData.peso ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.peso
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                />
                {formErrors.peso && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.peso}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Tipo de Ingreso</label>
                <select
                  name="tipo_ingreso"
                  value={formData.tipo_ingreso || ""}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.tipo_ingreso
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                >
                  <option value="" disabled>Seleccione tipo de ingreso...</option>
                  <option value="Por donación">Por donación</option>
                  <option value="Por requisito de exposición">Por requisito de exposición del autor</option>
                </select>
                {formErrors.tipo_ingreso && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.tipo_ingreso}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Clasificación Patrimonial</label>
                <select
                  name="clasificacion_patrimonial"
                  value={formData.clasificacion_patrimonial || "no_clasificado"}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90"
                >
                  <option value="no_clasificado">No clasificado</option>
                  <option value="BIC">BIC — Bien de Interés Cultural</option>
                  <option value="monumento">Monumento</option>
                  <option value="bien_cultural">Bien Cultural</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Descripción / Detalles adicionales</label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ""}
                onChange={handleChange}
                rows={2}
                placeholder="Descripción detallada de la obra..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-650 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90 resize-y"
              ></textarea>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Imagen de la Obra</label>
              {isEditing && formData.imagen_url ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    <div>
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">La imagen de esta obra no se puede cambiar.</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Si necesita actualizarla, elimine la obra y regístrela nuevamente.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImagenFile(file);
                    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                    const url = file ? URL.createObjectURL(file) : null;
                    previewUrlRef.current = url;
                    setImagenPreviewUrl(url);
                  }}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              )}
              {imagenPreviewUrl && (
                <div className="mt-3 w-full max-w-xs h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mx-auto sm:mx-0">
                  <img src={imagenPreviewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                </div>
              )}
              {!imagenPreviewUrl && formData.imagen_url && (
                <div className="mt-3 w-full max-w-xs h-48 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mx-auto sm:mx-0">
                  <img src={formData.imagen_url} alt="Imagen actual" className="w-full h-full object-contain p-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button variant="secondary" size="sm" type="button" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting} loading={isSubmitting}>
                {isEditing ? "Actualizar Obra" : "Registrar Obra"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <ObraDetailModal
        obra={selectedObraForDetail}
        onClose={() => setSelectedObraForDetail(null)}
        onEdit={(o) => { handleEdit(o); setSelectedObraForDetail(null); }}
        onHistorial={(o) => setSelectedObraForHistorial(o)}
      />
      <HistorialObraModal
        obra={selectedObraForHistorial}
        onClose={() => setSelectedObraForHistorial(null)}
      />
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        variant={confirm.variant}
        confirmLabel={confirm.confirmLabel}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
      />



      {/* Modal de Formulario de Artista */}
      <Modal isOpen={artistFormOpen} onClose={() => { setArtistFormOpen(false); setArtistSearchResults([]); setArtistSearchQuery(""); }} className="max-w-[540px] p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {isEditingArtist ? "Editar Artista" : "Nuevo Artista"}
          </h3>

          {/* Buscador por cédula/nombre */}
          {!isEditingArtist && (
            <div className="mb-4 p-3 bg-brand-50/50 dark:bg-gray-800/50 border border-brand-100 dark:border-gray-700 rounded-lg">
              <label className="block mb-2 text-sm font-bold text-brand-700 dark:text-brand-400">Buscar persona existente</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cédula, nombres o apellidos..."
                    value={artistSearchQuery}
                    onChange={(e) => setArtistSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleArtistSearch())}
                    className="pl-9 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200"
                  />
                </div>
                <Button type="button" size="xs" onClick={handleArtistSearch}
                  disabled={isSearchingArtist} loading={isSearchingArtist}>
                  Buscar
                </Button>
              </div>

              {/* Resultados de búsqueda */}
              {artistSearchResults.length > 0 && (
                <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                  {artistSearchResults.map((r, i) => (
                    <div
                      key={r.id_artista || i}
                      onClick={() => selectArtistSearchResult(r)}
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-white">{r.nombres} {r.apellidos}</p>
                        <p className="text-[11px] text-gray-500">{r.ci || 'Sin cédula'}</p>
                      </div>
                      {r.id_artista ? (
                        <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">Artista</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">Visitante</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleArtistSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Nombres <span className="text-red-500">*</span></label>
                <input type="text" name="nombres" value={artistFormData.nombres || ""} readOnly={isArtistPreloaded} onChange={(e) => { const v = e.target.value; setArtistFormData((p: any) => ({ ...p, nombres: v })); if (!isArtistPreloaded) setArtistFieldErrors((prev) => ({ ...prev, nombres: validateArtistField("nombres", v) })); }} className={"w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} required />
                {artistFieldErrors.nombres && !isArtistPreloaded && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg border border-red-200 dark:border-red-900/30 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium">{artistFieldErrors.nombres}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Apellidos</label>
                <input type="text" name="apellidos" value={artistFormData.apellidos || ""} readOnly={isArtistPreloaded} onChange={(e) => { const v = e.target.value; setArtistFormData((p: any) => ({ ...p, apellidos: v })); if (!isArtistPreloaded) setArtistFieldErrors((prev) => ({ ...prev, apellidos: validateArtistField("apellidos", v) })); }} className={"w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
                {artistFieldErrors.apellidos && !isArtistPreloaded && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg border border-red-200 dark:border-red-900/30 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium">{artistFieldErrors.apellidos}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Cédula</label>
                <input type="text" name="ci" value={artistFormData.ci || ""} readOnly={isArtistPreloaded} onChange={(e) => { const v = e.target.value; setArtistFormData((p: any) => ({ ...p, ci: v })); if (!isArtistPreloaded) setArtistFieldErrors((prev) => ({ ...prev, ci: validateArtistField("ci", v) })); }} className={"w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
                {artistFieldErrors.ci && !isArtistPreloaded && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg border border-red-200 dark:border-red-900/30 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium">{artistFieldErrors.ci}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Nacionalidad</label>
                <input type="text" name="nacionalidad" value={artistFormData.nacionalidad || ""} onChange={(e) => setArtistFormData((p: any) => ({ ...p, nacionalidad: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-brand-500 focus:outline-none dark:text-white/90" />
              </div>
            </div>
            {!artistFormData.id_artista && (
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={artistFormData.fecha_nacimiento || ""} readOnly={isArtistPreloaded} min={birthMinDate} max={birthMaxDate} onChange={(e) => { const v = e.target.value; setArtistFormData((p: any) => ({ ...p, fecha_nacimiento: v })); if (!isArtistPreloaded) setArtistFieldErrors((prev) => ({ ...prev, fecha_nacimiento: validateArtistField("fecha_nacimiento", v) })); }} className={"w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
                {artistFieldErrors.fecha_nacimiento && !isArtistPreloaded && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg border border-red-200 dark:border-red-900/30 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium">{artistFieldErrors.fecha_nacimiento}</p>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Teléfono</label>
                <input type="tel" name="telefono" value={artistFormData.telefono || ""} readOnly={isArtistPreloaded} onChange={(e) => { const v = e.target.value; setArtistFormData((p: any) => ({ ...p, telefono: v })); if (!isArtistPreloaded) setArtistFieldErrors((prev) => ({ ...prev, telefono: validateArtistField("telefono", v) })); }} onKeyDown={limitNumericInput} className={"w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
                {artistFieldErrors.telefono && !isArtistPreloaded && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg border border-red-200 dark:border-red-900/30 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium">{artistFieldErrors.telefono}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Correo</label>
                <input type="email" name="correo" value={artistFormData.correo || ""} readOnly={isArtistPreloaded} onChange={(e) => { const v = e.target.value; setArtistFormData((p: any) => ({ ...p, correo: v })); if (!isArtistPreloaded) setArtistFieldErrors((prev) => ({ ...prev, correo: validateArtistField("correo", v) })); }} className={"w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
                {artistFieldErrors.correo && !isArtistPreloaded && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg border border-red-200 dark:border-red-900/30 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium">{artistFieldErrors.correo}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">Dirección</label>
              <textarea name="direccion" value={artistFormData.direccion || ""} onChange={(e) => setArtistFormData((p: any) => ({ ...p, direccion: e.target.value }))} rows={2} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-brand-500 focus:outline-none dark:text-white/90 resize-y" />
            </div>
            <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button variant="secondary" size="sm" type="button" onClick={() => { setArtistFormOpen(false); setArtistSearchResults([]); setArtistSearchQuery(""); }}>
                Cancelar
              </Button>
              <Button size="sm" type="submit" disabled={isArtistSubmitting} loading={isArtistSubmitting}>
                {isEditingArtist ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
