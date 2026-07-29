import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { mavetApi } from "../services/api";
import { Artista, Obra } from "../types";
import { useModal } from "../hooks/useModal";
import { generateNextCode } from "../utils/codeGenerator";
import { validateEmail, validatePhone } from "../utils/validation";
import { useAuth, getUserRole } from "../context/AuthContext";
import toast from "react-hot-toast";

const initialFormState: Partial<Obra> & { id_artista?: number; id_tecnica?: number; id_estado_actual?: number; id_categoria_obra?: number; ancho?: number; largo?: number; alto?: number } = {
  id: "",
  codigo_inventario: "",
  titulo: "",
  ancho: undefined,
  largo: undefined,
  alto: undefined,
  ano: new Date().getFullYear(),
  id_categoria_obra: undefined,
  tipo_ingreso: "",
  piezas: 1,
  peso: undefined,
  descripcion: "",
  ubicacion: "",
  clasificacion_patrimonial: "no_clasificado",
};

export default function useInventario() {
  const { user } = useAuth();
  const userRole = getUserRole(user);

  const canEditObra = userRole === "Administrador" || userRole === "admin" || userRole === "Curador" || userRole === "Restaurador" || userRole === "Gerente";
  const canDeleteObra = userRole === "Administrador" || userRole === "admin" || userRole === "Gerente";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterCategoria, setFilterCategoria] = useState("Todos");
  const [filterAutor, setFilterAutor] = useState("Todos");
  const [filterUbicacion, setFilterUbicacion] = useState("Todos");
  const [filterClasificacion, setFilterClasificacion] = useState("Todos");
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
    if (!medidas) return { ancho: undefined, largo: undefined, alto: undefined };
    const parts = medidas.split(/[xX×]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (parts.length >= 3) return { ancho: parts[0], largo: parts[1], alto: parts[2] };
    if (parts.length >= 2) return { ancho: parts[0], largo: parts[1], alto: undefined };
    return { ancho: undefined, largo: undefined, alto: undefined };
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

  const tecnicasPorCategoria: Record<string, string[]> = {
    'Pintura': ['Óleo sobre Lienzo', 'Acrílico sobre Lienzo', 'Acuarela', 'Temple', 'Pastel', 'Mixta'],
    'Dibujo': ['Carboncillo', 'Tinta China', 'Acuarela', 'Pastel', 'Mixta'],
    'Escultura': ['Escultura en Bronce', 'Escultura en Mármol', 'Escultura en Madera', 'Mixta'],
    'Grabado': ['Grabado', 'Serigrafía', 'Litografía', 'Mixta'],
    'Fotografía': ['Fotografía Digital', 'Fotografía Analógica'],
    'Arte Digital': ['Arte Digital'],
    'Cerámica': ['Cerámica'],
    'Textil': ['Tejido', 'Telar', 'Bordado', 'Mixta'],
    'Instalación': ['Instalación', 'Mixta'],
    'Arte Objeto': ['Collage', 'Mixta'],
  };

  const filteredTecnicas = useMemo(() => {
    if (!selectedCategoryName || !formData.id_categoria_obra) return tecnicas;
    const normalizedName = selectedCategoryName.trim().toLowerCase();
    const entry = Object.entries(tecnicasPorCategoria).find(
      ([key]) => key.toLowerCase() === normalizedName
    );
    if (!entry) {
      console.warn('[Inventario] Categoría sin mapeo de técnicas:', selectedCategoryName);
      return tecnicas.filter((t: any) =>
        t.id_categoria_obra === formData.id_categoria_obra
      );
    }
    const permitidas = entry[1];
    const catId = formData.id_categoria_obra;
    return tecnicas.filter((t: any) => {
      const nombre = (t.nombre_tecnica || '').toLowerCase().trim();
      if (permitidas.some(p => p.toLowerCase() === nombre)) return true;
      if (t.id_categoria_obra === catId) return true;
      return false;
    });
  }, [selectedCategoryName, formData.id_categoria_obra, tecnicas]);

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
    if (name === "alto") {
      if (value === "" || value === undefined || value === null) return "";
      const num = Number(value);
      if (isNaN(num) || num <= 0) return "El alto debe ser un número positivo.";
      if (num > 1000) return "El alto no puede superar los 1000 cm.";
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
        if (newCat && prev.id_tecnica) {
          const catName = newCat.nombre_categoria;
          const normalizedCatName = catName.trim().toLowerCase();
          const entry = Object.entries(tecnicasPorCategoria).find(
            ([key]) => key.toLowerCase() === normalizedCatName
          );
          const permitidas = entry ? entry[1] : null;
          const tecnicaActual = tecnicas.find((t: any) => t.id_tecnica === prev.id_tecnica);
          if (tecnicaActual && permitidas && !permitidas.some(p => p.toLowerCase() === (tecnicaActual.nombre_tecnica || '').toLowerCase().trim())) {
            delete newData.id_tecnica;
          }
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
    if (!formData.id_tecnica && !isOtherTecnica) errors.id_tecnica = "Seleccione una técnica";
    if (isOtherTecnica && !customTecnica.trim()) errors.customTecnica = "Especifique la técnica";

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
        const nuevaTecnica = await mavetApi.crearTecnica({
          nombre_tecnica: customTecnica.trim(),
          id_categoria_obra: isOtherCategoria ? undefined : formData.id_categoria_obra,
        });
        tecnicaId = nuevaTecnica?.id_tecnica ?? nuevaTecnica?.id;
        if (!tecnicaId || String(tecnicaId) === "other") {
          const tecnicasList = await mavetApi.getTecnicas();
          const found = tecnicasList.find(
            (t: any) => t.nombre_tecnica?.toLowerCase() === customTecnica.trim().toLowerCase()
          );
          if (found) tecnicaId = found.id_tecnica;
        }
        const tecData = await mavetApi.getTecnicas();
        setTecnicas(tecData);
      }

      if (isOtherCategoria) {
        const nuevaCategoria = await mavetApi.crearCategoria({ nombre_categoria: customCategoria.trim() });
        categoriaId = nuevaCategoria.id_categoria_obra ?? nuevaCategoria.id;
        const catData = await mavetApi.getCategoriasObra();
        setCategorias(catData);
      }

      // Excluir campos de solo-lectura del frontend que no son columnas de la BD
      const { id: _omitId, ubicacion, ano, ancho, largo, alto, clasificacion_patrimonial: _cp,
              autor: _autor, tecnica: _tecnica, categoria: _categoria, estado: _estado,
              ...restForm } = formData;
      const medidasStr = formData.ancho && formData.largo
        ? (formData.alto ? `${Number(formData.ancho)}x${Number(formData.largo)}x${Number(formData.alto)}` : `${Number(formData.ancho)}x${Number(formData.largo)}`)
        : undefined;
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
        if (!trimmed) error = "El apellido del artista es obligatorio.";
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

    const fieldsToCheck = ["nombres", "apellidos"];
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
    for (const key of Object.keys(payload)) {
      if (payload[key] === "" || payload[key] == null) delete payload[key];
    }
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

    const result = obras.filter((obra) => {
      const titulo = (obra.titulo || "").toLowerCase();
      const obraId = (obra.id || "").toLowerCase();
      const codigo = (obra.codigo_inventario || "").toLowerCase();
      const autor = (obra.autor || "").toLowerCase();

      const matchesSearch = !q || titulo.includes(q) || obraId.includes(q) || codigo.includes(q) || autor.includes(q);
      const matchesEstado = filterEstado === "Todos" || obra.estado === filterEstado;
      const matchesCategoria = filterCategoria === "Todos" || obra.categoria === filterCategoria || String(obra.id_categoria_obra) === filterCategoria;
      const matchesAutor = filterAutor === "Todos" || obra.autor === filterAutor || String(obra.id_artista) === filterAutor;
      const matchesUbicacion = filterUbicacion === "Todos" || obra.ubicacion === filterUbicacion;
      const matchesClasificacion = filterClasificacion === "Todos" || obra.clasificacion_patrimonial === filterClasificacion;

      return matchesSearch && matchesEstado && matchesCategoria && matchesAutor && matchesUbicacion && matchesClasificacion;
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
      if (sortConfig.key === "anio") {
        const aAnio = parseInt(a.ano || a.anio || "0", 10);
        const bAnio = parseInt(b.ano || b.anio || "0", 10);
        return sortConfig.direction === "asc" ? aAnio - bAnio : bAnio - aAnio;
      }
      const aVal = (a[sortConfig.key] ?? "").toString().toLowerCase();
      const bVal = (b[sortConfig.key] ?? "").toString().toLowerCase();
      return sortConfig.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [obras, searchTerm, filterEstado, filterCategoria, filterAutor, filterUbicacion, filterClasificacion, sortKey]);

  return {
    userRole, canEditObra, canDeleteObra,
    previewUrlRef, artistDropdownRef,
    obras, artistas, tecnicas, estados, categorias, espacios,
    isLoading,
    searchTerm, setSearchTerm,
    filterEstado, setFilterEstado,
    filterCategoria, setFilterCategoria,
    filterAutor, setFilterAutor,
    filterUbicacion, setFilterUbicacion,
    filterClasificacion, setFilterClasificacion,
    sortConfig, handleSort,
    isOpen, openModal, closeModal,
    formData, setFormData,
    imagenFile, setImagenFile,
    imagenPreviewUrl, setImagenPreviewUrl,
    customTecnica, setCustomTecnica,
    customCategoria, setCustomCategoria,
    isEditing,
    selectedObraForDetail, setSelectedObraForDetail,
    selectedObraForHistorial, setSelectedObraForHistorial,
    isSubmitting,
formErrors, setFormErrors,
    confirm, setConfirm,
    currentPage, totalPages, totalItems, ITEMS_PER_PAGE,
    goToPage,
    handleOpenAdd, handleEdit, handleDelete,
    handleChange, handleSave,
    artistsList, setArtistsList,
    artistSearch, setArtistSearch,
    artistFormOpen, setArtistFormOpen,
    artistFormData, setArtistFormData,
    artistSearchQuery, setArtistSearchQuery,
    artistSearchResults, setArtistSearchResults,
    isSearchingArtist,
    isEditingArtist, setIsEditingArtist,
    isArtistPreloaded, setIsArtistPreloaded,
    isArtistSubmitting,
    artistFieldErrors, setArtistFieldErrors,
    artistInput, setArtistInput,
    artistDropdownOpen, setArtistDropdownOpen,
    parseCedula, normalizeCedula,
    birthMinDate, birthMaxDate,
    fetchArtistsList,
    handleArtistSearch, selectArtistSearchResult,
    handleArtistFormOpen, handleArtistDelete, handleArtistSave,
    validateCedula,
    filteredArtistsList,
    filteredObras,
    filteredTecnicas,
    fetchObrasPaginated,
  };
}
