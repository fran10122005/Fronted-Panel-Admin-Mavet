import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { mavetApi } from "../services/api";
import { useDebounce } from "./useDebounce";
import { useModal } from "./useModal";
import { generateNextCode } from "../utils/codeGenerator";
import { Libro, PrestamoPayload, Prestamo } from "../types";

const today = new Date().toISOString().split("T")[0];

const initialLibroState: Libro = {
  id: "",
  unidad: "",
  cuota: "",
  titulo: "",
  autor: "",
  estante: "",
  ano_libro: "",
  id_categoria: undefined,
  categoria: "",
  cantidad_total: 1,
  cantidad_disponible: 1,
  estado: "Aprobado",
  fecha_ingreso: today,
};

export const ITEMS_PER_PAGE = 20;

export function useLibros() {
  const { isOpen: isPrestamoOpen, openModal: openPrestamo, closeModal: closePrestamo } = useModal();
  const { isOpen: isLibroOpen, openModal: openLibro, closeModal: closeLibro } = useModal();

  const [libros, setLibros] = useState<Libro[]>([]);
  const [autores, setAutores] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterAutor, setFilterAutor] = useState("Todos");

  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; variant?: "danger" | "warning" | "info" }>({
    open: false, title: "", message: "", onConfirm: () => {}, variant: "danger",
  });

  const [selectedLibroId, setSelectedLibroId] = useState<string>("");
  const [selectedLibroTitle, setSelectedLibroTitle] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [libroFormData, setLibroFormData] = useState<Libro>(initialLibroState);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLibroForDetail, setSelectedLibroForDetail] = useState<Libro | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLibrosPaginated = async (page: number) => {
    const result = await mavetApi.getLibros(page, ITEMS_PER_PAGE);
    if (result.data.length === 0 && page > 1) {
      return fetchLibrosPaginated(page - 1);
    }
    setLibros(result.data);
    setCurrentPage(result.currentPage);
    setTotalPages(result.totalPages);
    setTotalItems(result.totalItems);
  };

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setIsLoading(true);
    fetchLibrosPaginated(page).finally(() => setIsLoading(false));
  }, [totalPages]);

  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [searchCedula, setSearchCedula] = useState("");

  const fetchDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const [autoresData, catData, prestamosData] = await Promise.all([
        mavetApi.getAutoresLibro(),
        mavetApi.getCategoriasLibro(),
        mavetApi.getPrestamosBiblioteca(),
      ]);
      setAutores(autoresData);
      setCategorias(catData);
      setPrestamos(prestamosData);
      await fetchLibrosPaginated(1);
    } catch {
      console.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleOpenPrestamo = (id: string, titulo: string) => {
    setSelectedLibroId(id);
    setSelectedLibroTitle(titulo);
    openPrestamo();
  };

  const handlePrestamoSubmit = async (data: { cedula: string; nombre: string }) => {
    setIsSubmitting(true);
    const payload: PrestamoPayload = {
      libroId: selectedLibroId,
      cedulaSolicitante: data.cedula,
      nombreSolicitante: data.nombre,
      horaPrestamo: new Date().toISOString(),
      estado: "ACTIVO",
    };
    try {
      const response = await mavetApi.registrarPrestamo(payload);
      closePrestamo();
      toast.success(response.message);
      await fetchLibrosPaginated(currentPage);
      const prestamosRes = await mavetApi.getPrestamosBiblioteca();
      setPrestamos(prestamosRes);
    } catch {
      toast.error("Ocurrió un error al registrar el préstamo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLibro = (id: string) => {
    setConfirm({
      open: true,
      title: "Eliminar libro",
      message: "¿Está seguro de que desea eliminar este libro del inventario?",
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, open: false }));
        try {
          setIsLoading(true);
          await mavetApi.eliminarLibro(id);
          await fetchLibrosPaginated(currentPage);
          toast.success("Libro eliminado exitosamente.");
        } catch (error: any) {
          toast.error(error.message || "Error al eliminar libro.");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const [customCategoria, setCustomCategoria] = useState("");
  const [autorNombre, setAutorNombre] = useState("");
  const [autorApellido, setAutorApellido] = useState("");

  const handleOpenAddLibro = () => {
    const nextUnidad = generateNextCode(
      libros.map(l => l.unidad),
      "BIB",
      3
    );
    setLibroFormData({ ...initialLibroState, unidad: nextUnidad, fecha_ingreso: today });
    setAutorNombre("");
    setAutorApellido("");
    setIsEditing(false);
    openLibro();
  };

  const handleEditLibro = (libro: Libro) => {
    setLibroFormData({ ...libro });
    const autorEncontrado = autores.find((a: any) => a.id_autor === libro.id_autor);
    setAutorNombre(autorEncontrado?.nombre || libro.autor.split(" ")[0] || "");
    setAutorApellido(autorEncontrado?.apellido || libro.autor.split(" ").slice(1).join(" ") || "");
    setIsEditing(true);
    openLibro();
  };

  const handleLibroSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let payload: any = { ...data };

      // Crear o buscar el autor
      const nombreAutor = data.autorNombre.trim();
      const apellidoAutor = (data.autorApellido || "").trim();
      const existente = autores.find(
        (a: any) =>
          a.nombre?.toLowerCase() === nombreAutor.toLowerCase() &&
          a.apellido?.toLowerCase() === apellidoAutor.toLowerCase()
      );
      if (existente) {
        payload.id_autor = existente.id_autor;
      } else {
        const nuevoAutor = await mavetApi.crearAutorLibro({
          nombre: nombreAutor,
          apellido: apellidoAutor || undefined,
        });
        payload.id_autor = nuevoAutor.id_autor ?? nuevoAutor.id;
        setAutores(prev => [...prev, nuevoAutor]);
      }
      delete payload.autorNombre;
      delete payload.autorApellido;

      // Si seleccionó "Otra..." y hay texto, crear la categoría primero
      if (payload.id_categoria === -1 && payload.customCategoria?.trim()) {
        const nuevaCat = await mavetApi.crearCategoriaLibro({ nombre_categoria: payload.customCategoria.trim() });
        payload.id_categoria = nuevaCat.id_categoria ?? nuevaCat.id;
        setCategorias(prev => [...prev, nuevaCat]);
      }
      delete payload.customCategoria;

      if (isEditing) {
        await mavetApi.actualizarLibro(libroFormData.id, payload);
        toast.success("Libro actualizado correctamente.");
      } else {
        await mavetApi.crearLibro(payload);
        toast.success("Nuevo libro registrado exitosamente.");
      }
      await fetchLibrosPaginated(currentPage || 1);
      closeLibro();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el libro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLibros = useMemo(() => {
    return libros.filter((libro) => {
      const autorStr   = libro.autor  || "";
      const unidadStr  = libro.unidad || "";
      const tituloStr  = libro.titulo || "";
      const catStr     = libro.categoria || "";
      const matchesSearch =
        tituloStr.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        unidadStr.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        autorStr.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesEstado = filterEstado === "Todos" || libro.estado === filterEstado;
      const matchesCategoria = filterCategoria === "Todas" || catStr === filterCategoria;
      const matchesAutor = filterAutor === "Todos" || autorStr.toLowerCase().includes(filterAutor.toLowerCase());
      return matchesSearch && matchesEstado && matchesCategoria && matchesAutor;
    });
  }, [libros, debouncedSearch, filterEstado, filterCategoria, filterAutor]);

  const filteredPrestamos = useMemo(() => {
    if (!searchCedula.trim()) return prestamos.filter(p => p.estado === "ACTIVO");
    return prestamos.filter(p =>
      p.cedulaSolicitante.toLowerCase().includes(searchCedula.toLowerCase())
    );
  }, [prestamos, searchCedula]);

  return {
    libros, autores, categorias, prestamos, setPrestamos, isLoading,
    searchTerm, setSearchTerm, debouncedSearch,
    filterEstado, setFilterEstado,
    filterCategoria, setFilterCategoria,
    filterAutor, setFilterAutor,
    searchCedula, setSearchCedula,
    currentPage, totalPages, totalItems,
    filteredLibros, filteredPrestamos,
    isPrestamoOpen, closePrestamo,
    isLibroOpen, closeLibro,
    selectedLibroId, selectedLibroTitle,
    isSubmitting,
    libroFormData, isEditing,
    selectedLibroForDetail, setSelectedLibroForDetail,
    confirm, setConfirm,
    goToPage, handleOpenPrestamo, handlePrestamoSubmit,
    handleOpenAddLibro, handleEditLibro, handleDeleteLibro,
    handleLibroSubmit,
    initialLibroState,
    customCategoria, setCustomCategoria,
    autorNombre, setAutorNombre, autorApellido, setAutorApellido,
    fetchDatos,
  };
}
