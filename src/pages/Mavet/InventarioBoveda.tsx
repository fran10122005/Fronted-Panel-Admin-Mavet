import { useState, useEffect, useMemo, useRef } from "react";
import { mavetApi } from "../../services/api";
import { exportarInventarioObras } from "../../services/pdf.service";
import { Artista, Obra } from "../../types";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { useModal } from "../../hooks/useModal";
import { generateNextCode } from "../../utils/codeGenerator";
import { limitNumericInput, validateEmail, validatePhone } from "../../utils/validation";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const initialFormState: Partial<Obra> & { id_artista?: number, id_tecnica?: number, id_estado_actual?: number, id_categoria_obra?: number } = {
  id: "",
  codigo_inventario: "",
  titulo: "",
  medidas: "",
  ano: new Date().getFullYear(),
  id_categoria_obra: undefined,
  tipo_ingreso: "",
  piezas: 1,
  peso: undefined,
  descripcion: "",
  ubicacion: "",
};

export default function InventarioBoveda() {
  const { user } = useAuth();
  const userRole = user?.Role?.nombre_rol || user?.rol || "Administrador";

  const canEditObra = userRole === "Administrador" || userRole === "admin" || userRole === "Curador";
  const canDeleteObra = userRole === "Administrador" || userRole === "admin" || userRole === "Gerente";

  const previewUrlRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
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

  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<any>(initialFormState);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState<string | null>(null);
  const [customTecnica, setCustomTecnica] = useState("");

  const [customCategoria, setCustomCategoria] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedObraForDetail, setSelectedObraForDetail] = useState<Obra | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleEdit = (obra: Obra) => {
    setFormData(obra);
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
    
    if (name === "id_tecnica" && value !== "other") {
      setCustomTecnica("");
    }

    if (name === "id_categoria_obra" && value !== "other") {
      setCustomCategoria("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOtherTecnica = String(formData.id_tecnica) === "other";
    const isOtherCategoria = String(formData.id_categoria_obra) === "other";

    const errors: Record<string, string> = {};
    if (!formData.titulo?.trim()) errors.titulo = "El título es obligatorio";
    if (formData.id_artista == null) errors.id_artista = "Debe seleccionar un autor/artista";
    if (!formData.medidas?.trim()) errors.medidas = "Las medidas son obligatorias";
    if (!formData.ano || isNaN(formData.ano) || formData.ano < 1000 || formData.ano > new Date().getFullYear() + 5) {
      errors.ano = "Año inválido (1000-" + (new Date().getFullYear() + 5) + ")";
    }
    if (!formData.id_estado_actual) errors.id_estado_actual = "Seleccione un estado";
    if (!formData.id_categoria_obra && !isOtherCategoria) errors.id_categoria_obra = "Seleccione una categoría";
    if (isOtherCategoria && !customCategoria.trim()) errors.customCategoria = "Especifique la categoría";
    if (isPintura && !formData.id_tecnica && !isOtherTecnica) errors.id_tecnica = "Seleccione una técnica";
    if (isPintura && isOtherTecnica && !customTecnica.trim()) errors.customTecnica = "Especifique la técnica";
    if (!formData.tipo_ingreso) errors.tipo_ingreso = "Seleccione tipo de ingreso";
    if (!formData.ubicacion?.trim()) errors.ubicacion = "La ubicación es obligatoria";
    if (!formData.piezas || formData.piezas < 1) errors.piezas = "Debe ser al menos 1";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    try {
      let tecnicaId = formData.id_tecnica;
      let estadoId = formData.id_estado_actual;
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

      const { id: _omitId, ubicacion, ano, ...restForm } = formData;
      const payloadBase = {
        ...restForm,
        ubicacion_actual: ubicacion,
        anio: ano !== undefined && ano !== "" ? parseInt(ano.toString(), 10) : null,
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
    if (!artistFormData.nombres?.trim()) { toast.error("El nombre del artista es obligatorio."); return; }
    if (!artistFormData.apellidos?.trim()) { toast.error("Los apellidos del artista son obligatorios."); return; }
    if (artistFormData.correo?.trim()) {
      const emailErr = validateEmail(artistFormData.correo, "El correo");
      if (emailErr) { toast.error(emailErr); return; }
    }
    if (artistFormData.telefono?.trim()) {
      const phoneErr = validatePhone(artistFormData.telefono, "El teléfono");
      if (phoneErr) { toast.error(phoneErr); return; }
    }
    setIsArtistSubmitting(true);
    try {
      if (isEditingArtist) {
        await mavetApi.actualizarArtista(artistFormData.id_artista, artistFormData);
        toast.success("Artista actualizado");
      } else {
        await mavetApi.crearArtista(artistFormData);
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

  // Filtrado reactivo de las obras
  const filteredObras = useMemo(() => {
    return obras.filter((obra) => {
      const matchesSearch = 
        obra.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
        obra.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (obra.codigo_inventario && obra.codigo_inventario.toLowerCase().includes(searchTerm.toLowerCase())) ||
        obra.autor.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesEstado = filterEstado === "Todos" || obra.estado === filterEstado;
      
      return matchesSearch && matchesEstado;
    });
  }, [obras, searchTerm, filterEstado]);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario de Bóveda</h1>
          <p className="text-sm text-gray-500">Catálogo de obras de arte registradas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (obras.length === 0) return;
              exportarInventarioObras(filteredObras);
            }}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          {canEditObra && (
            <>
              <button
                onClick={() => handleArtistFormOpen()}
                className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="hidden sm:inline">Agregar Artista</span>
                <span className="sm:hidden">Artista</span>
              </button>
              <button 
                onClick={handleOpenAdd}
                className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                <span className="hidden sm:inline">Agregar Nueva Obra</span>
                <span className="sm:hidden">Nueva Obra</span>
              </button>
            </>
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
              type="text"
              placeholder="Buscar por código, título o autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Estado:</span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90"
            >
              <option value="Todos">Todos</option>
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Restauración">En Restauración</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSkeleton variant="table" rows={8} cols={6} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
                    <th className="px-5 py-2">Código</th>
                    <th className="px-5 py-2">Título</th>
                    <th className="px-5 py-2">Autor</th>
                    <th className="px-5 py-2">Categoría/Modalidad</th>
                    <th className="px-5 py-2">Ubicación</th>
                    <th className="px-5 py-2 text-center">Estado</th>
                    <th className="px-5 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredObras.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-6 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-base font-medium">No se encontraron resultados</p>
                        <p className="text-sm mt-1">Prueba ajustando tu búsqueda o filtros.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredObras.map((obra) => (
                      <tr 
                        key={obra.id} 
                        onClick={() => setSelectedObraForDetail(obra)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-2 font-mono text-xs text-brand-600 dark:text-brand-400 font-medium">{obra.codigo_inventario || obra.id}</td>
                        <td className="px-5 py-2 font-semibold">{obra.titulo}</td>
                        <td className="px-5 py-2">{obra.autor}</td>
                        <td className="px-5 py-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400">
                            {obra.categoria || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-2 text-gray-600 dark:text-gray-400">{obra.ubicacion}</td>
                        <td className="px-5 py-2 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            obra.estado === 'Excelente' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-400' :
                            obra.estado === 'Bueno' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400' :
                            'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400'
                          }`}>
                            {obra.estado}
                          </span>
                        </td>
                        <td className="px-5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {canEditObra && (
                              <button 
                                onClick={() => handleEdit(obra)}
                                className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                </svg>
                              </button>
                            )}
                            {canDeleteObra && (
                              <button 
                                onClick={() => handleDelete(obra.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
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
            <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400 gap-4 mt-auto">
              <span>Página {currentPage} de {totalPages} ({totalItems} obras)</span>
              <div className="flex gap-2">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
              </div>
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
              className="pl-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
                <th className="px-5 py-2">Nombres</th>
                <th className="px-5 py-2">Apellidos</th>
                <th className="px-5 py-2">Cédula</th>
                <th className="px-5 py-2">Teléfono</th>
                <th className="px-5 py-2">Nacionalidad</th>
                <th className="px-5 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredArtistsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-gray-500">
                    <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm font-medium">No hay artistas registrados.</p>
                  </td>
                </tr>
              ) : (
                filteredArtistsList.map((a) => (
                  <tr key={a.id_artista} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-2 font-semibold">{a.nombres}</td>
                    <td className="px-5 py-2">{a.apellidos}</td>
                    <td className="px-5 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">{a.ci || '—'}</td>
                    <td className="px-5 py-2">{a.telefono || '—'}</td>
                    <td className="px-5 py-2">
                      {a.nacionalidad ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400">{a.nacionalidad}</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canEditObra && (
                          <button onClick={() => handleArtistFormOpen(a)} className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                        {canDeleteObra && (
                          <button onClick={() => handleArtistDelete(a.id_artista)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
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
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código / Serial</label>
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
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.titulo
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                />
                {formErrors.titulo && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.titulo}</p>}
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Autor / Artista</label>
                <select
                  name="id_artista"
                  value={formData.id_artista ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.id_artista
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                >
                  <option value="" disabled>Seleccione un artista...</option>
                  {artistas.map((a: any) => (
                    <option key={a.id_artista} value={a.id_artista}>{a.nombres} {a.apellidos}</option>
                  ))}
                </select>
                {formErrors.id_artista && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.id_artista}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Medidas</label>
                <input
                  type="text"
                  name="medidas"
                  value={formData.medidas}
                  onChange={handleChange}
                  placeholder="Ej. 120x80 cm"
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.medidas
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                />
                {formErrors.medidas && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.medidas}</p>}
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Año</label>
                <input
                  type="number"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  onKeyDown={limitNumericInput}
                  min={1000}
                  max={new Date().getFullYear() + 5}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.ano
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                />
                {formErrors.ano && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.ano}</p>}
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado de Conservación</label>
                <select
                  name="id_estado_actual"
                  value={formData.id_estado_actual || ""}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.id_estado_actual
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
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
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría / Modalidad</label>
                {String(formData.id_categoria_obra) === "other" ? (
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={customCategoria}
                      onChange={(e) => setCustomCategoria(e.target.value)}
                      placeholder="Especifique la categoría..."
                      className={`flex-1 min-w-0 rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                        formErrors.customCategoria
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
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
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                      formErrors.id_categoria_obra
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
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
                  <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Técnica</label>
                  {String(formData.id_tecnica) === "other" ? (
                    <div className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={customTecnica}
                        onChange={(e) => setCustomTecnica(e.target.value)}
                        placeholder="Especifique la técnica..."
                        className={`flex-1 min-w-0 rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                          formErrors.customTecnica
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
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
                      className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                        formErrors.id_tecnica
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
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
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</label>
                <select
                  name="ubicacion"
                  value={formData.ubicacion || ""}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.ubicacion
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                >
                  <option value="" disabled>Seleccione una ubicación...</option>
                  {espacios.map((e: any) => (
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
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad de Piezas</label>
                <input
                  type="number"
                  name="piezas"
                  min={1}
                  value={formData.piezas ?? 1}
                  onChange={handleChange}
                  onKeyDown={limitNumericInput}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.piezas
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                  }`}
                  required
                />
                {formErrors.piezas && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.piezas}</p>}
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peso (kg)</label>
                <input
                  type="number"
                  name="peso"
                  step="0.01"
                  min={0}
                  value={formData.peso || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90"
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo de Ingreso</label>
                <select
                  name="tipo_ingreso"
                  value={formData.tipo_ingreso || ""}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 ${
                    formErrors.tipo_ingreso
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
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
            </div>

            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción / Detalles adicionales</label>
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
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imagen de la Obra</label>
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
              {imagenPreviewUrl && (
                <div className="mt-3 w-full max-w-xs h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mx-auto sm:mx-0">
                  <img src={imagenPreviewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                </div>
              )}
              {isEditing && formData.imagen_url && !imagenFile && (
                <p className="mt-1 text-xs text-gray-500">Ya existe una imagen cargada. Suba un archivo solo si desea reemplazarla.</p>
              )}
              {!imagenPreviewUrl && formData.imagen_url && !imagenFile && (
                <div className="mt-3 w-full max-w-xs h-48 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mx-auto sm:mx-0">
                  <img src={formData.imagen_url} alt="Imagen actual" className="w-full h-full object-contain p-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-1.5 text-xs font-semibold text-gray-750 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isEditing ? "Actualizar Obra" : "Registrar Obra"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Detalle (Ficha de Obra) */}
      <Modal
        isOpen={selectedObraForDetail !== null}
        onClose={() => setSelectedObraForDetail(null)}
        showCloseButton={false}
        className="max-w-3xl p-0 overflow-hidden"
      >
        {selectedObraForDetail && (
          <div className="p-6 bg-[#fcfafa] dark:bg-gray-900 flex flex-col justify-between min-h-[420px]">
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                      {selectedObraForDetail.titulo}
                    </h2>
                    <p className="text-brand-500 dark:text-brand-400 font-semibold text-xs mt-1">
                      • {selectedObraForDetail.autor}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedObraForDetail(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Cerrar"
                  >
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tarjeta Estado de Conservación */}
                <div className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm my-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado de Conservación</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Condición Actual</span>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                    selectedObraForDetail.estado === 'Excelente' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' :
                    selectedObraForDetail.estado === 'Bueno' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40' :
                    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/40'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    {selectedObraForDetail.estado}
                  </span>
                </div>

                {/* Grilla de Parámetros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                  {/* Categoría */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categoría</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedObraForDetail.categoria || '—'}</span>
                    </div>
                  </div>

                  {/* Técnica */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Técnica</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedObraForDetail.tecnica || '—'}</span>
                    </div>
                  </div>

                  {/* Medidas */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Medidas</span>
                      <span className="text-xs font-semibold text-gray-855 dark:text-gray-200">{selectedObraForDetail.medidas || '—'}</span>
                    </div>
                  </div>

                  {/* Peso */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Peso</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedObraForDetail.peso ? `${selectedObraForDetail.peso} kg` : '—'}</span>
                    </div>
                  </div>

                  {/* Año de creación */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Año de Creación</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedObraForDetail.ano || '—'}</span>
                    </div>
                  </div>

                  {/* Cantidad de piezas */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cantidad de Piezas</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-250">{selectedObraForDetail.piezas ?? '—'}</span>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ubicación</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedObraForDetail.ubicacion || '—'}</span>
                    </div>
                  </div>

                  {/* Tipo de ingreso */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipo de Ingreso</span>
                      <span className="inline-block text-[10px] font-semibold text-gray-850 dark:text-gray-200 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-100 dark:border-yellow-900/30">
                        {selectedObraForDetail.tipo_ingreso || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descripción (si existe) */}
                {selectedObraForDetail.descripcion && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Descripción / Detalles Adicionales</span>
                    <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-outfit">
                      {selectedObraForDetail.descripcion}
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones del pie */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setSelectedObraForDetail(null)}
                  className="px-5 py-2 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedObraForDetail);
                    setSelectedObraForDetail(null);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Obra
                </button>
              </div>
            </div>
        )}
      </Modal>
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
              <label className="block mb-1.5 text-[11px] font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider">Buscar persona existente</label>
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
                    className="pl-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleArtistSearch}
                  disabled={isSearchingArtist}
                  className="px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-xs font-semibold transition-colors disabled:opacity-60 flex items-center gap-1"
                >
                  {isSearchingArtist ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  )}
                  Buscar
                </button>
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
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombres</label>
                <input type="text" name="nombres" value={artistFormData.nombres || ""} readOnly={isArtistPreloaded} onChange={(e) => setArtistFormData((p: any) => ({ ...p, nombres: e.target.value }))} className={"w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} required />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apellidos</label>
                <input type="text" name="apellidos" value={artistFormData.apellidos || ""} readOnly={isArtistPreloaded} onChange={(e) => setArtistFormData((p: any) => ({ ...p, apellidos: e.target.value }))} className={"w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cédula</label>
                <input type="text" name="ci" value={artistFormData.ci || ""} readOnly={isArtistPreloaded} onChange={(e) => setArtistFormData((p: any) => ({ ...p, ci: e.target.value }))} className={"w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nacionalidad</label>
                <input type="text" name="nacionalidad" value={artistFormData.nacionalidad || ""} onChange={(e) => setArtistFormData((p: any) => ({ ...p, nacionalidad: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" />
              </div>
            </div>
            {!artistFormData.id_artista && (
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={artistFormData.fecha_nacimiento || ""} readOnly={isArtistPreloaded} onChange={(e) => setArtistFormData((p: any) => ({ ...p, fecha_nacimiento: e.target.value }))} className={"w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teléfono</label>
                <input type="tel" name="telefono" value={artistFormData.telefono || ""} readOnly={isArtistPreloaded} onChange={(e) => setArtistFormData((p: any) => ({ ...p, telefono: e.target.value }))} onKeyDown={limitNumericInput} className={"w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Correo</label>
                <input type="email" name="correo" value={artistFormData.correo || ""} readOnly={isArtistPreloaded} onChange={(e) => setArtistFormData((p: any) => ({ ...p, correo: e.target.value }))} className={"w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none dark:text-white/90 " + (isArtistPreloaded ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900")} />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dirección</label>
              <textarea name="direccion" value={artistFormData.direccion || ""} onChange={(e) => setArtistFormData((p: any) => ({ ...p, direccion: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90 resize-y" />
            </div>
            <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => { setArtistFormOpen(false); setArtistSearchResults([]); setArtistSearchQuery(""); }} className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={isArtistSubmitting} className="flex items-center justify-center min-w-[110px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-70 disabled:cursor-wait">
                {isArtistSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isEditingArtist ? "Actualizar" : "Guardar"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
