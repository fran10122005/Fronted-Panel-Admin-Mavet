import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { exportarCatalogoBiblioteca } from "../../services/pdf.service";
import { Libro, PrestamoPayload, Prestamo } from "../../types";

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
  id_autor: undefined,
};

export default function Biblioteca() {
  const { isOpen: isPrestamoOpen, openModal: openPrestamo, closeModal: closePrestamo } = useModal();
  const { isOpen: isLibroOpen, openModal: openLibro, closeModal: closeLibro } = useModal();

  const [libros, setLibros] = useState<Libro[]>([]);
  const [autores, setAutores] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterAutor, setFilterAutor] = useState("Todos");

  // Modal Prestamo
  const [selectedLibroId, setSelectedLibroId] = useState<string>("");
  const [selectedLibroTitle, setSelectedLibroTitle] = useState<string>("");
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Libro
  const [libroFormData, setLibroFormData] = useState<Libro>(initialLibroState);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLibroForDetail, setSelectedLibroForDetail] = useState<Libro | null>(null);

  // Alert
  const [alertInfo, setAlertInfo] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  // Estado préstamos
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [searchCedula, setSearchCedula] = useState("");

  // ───────── Carga de datos ─────────
  const fetchDatos = async () => {
    setIsLoading(true);
    try {
      const [librosData, autoresData, catData, prestamosData] = await Promise.all([
        mavetApi.getLibros(),
        mavetApi.getAutoresLibro(),
        mavetApi.getCategoriasLibro(),
        mavetApi.getPrestamosBiblioteca(),
      ]);
      setLibros(librosData);
      setAutores(autoresData);
      setCategorias(catData);
      setPrestamos(prestamosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  // ───────── Préstamo ─────────
  const handleOpenPrestamo = (id: string, titulo: string) => {
    setSelectedLibroId(id);
    setSelectedLibroTitle(titulo);
    openPrestamo();
  };

  const handlePrestamoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload: PrestamoPayload = {
      libroId: selectedLibroId,
      cedulaSolicitante: cedula,
      nombreSolicitante: nombre,
      horaPrestamo: new Date().toISOString(),
      estado: "ACTIVO",
    };
    try {
      const response = await mavetApi.registrarPrestamo(payload);
      closePrestamo();
      showAlert(response.message, "success");
      setCedula("");
      setNombre("");
      await fetchDatos();
    } catch {
      showAlert("Ocurrió un error al registrar el préstamo.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────── CRUD Libros ─────────
  const handleOpenAddLibro = () => {
    setLibroFormData(initialLibroState);
    setIsEditing(false);
    openLibro();
  };

  const handleEditLibro = (libro: Libro) => {
    setLibroFormData({ ...libro });
    setIsEditing(true);
    openLibro();
  };

  const handleDeleteLibro = async (id: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este libro del inventario?")) return;
    try {
      setIsLoading(true);
      await mavetApi.eliminarLibro(id);
      await fetchDatos();
      showAlert("Libro eliminado exitosamente.", "success");
    } catch (error: any) {
      showAlert(error.message || "Error al eliminar libro.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLibroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLibroFormData((prev) => ({
      ...prev,
      [name]:
        name === "cantidad_total" || name === "cantidad_disponible"
          ? parseInt(value) || 0
          : name === "id_autor" || name === "id_categoria"
          ? parseInt(value) || undefined
          : value,
    }));
  };

  const handleLibroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!libroFormData.titulo || !libroFormData.id_autor || !libroFormData.id_categoria) {
      showAlert("Completa los campos obligatorios: Título, Autor y Categoría.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await mavetApi.actualizarLibro(libroFormData.id, libroFormData);
        showAlert("Libro actualizado correctamente.", "success");
      } else {
        await mavetApi.crearLibro(libroFormData);
        showAlert("Nuevo libro registrado exitosamente.", "success");
      }
      await fetchDatos();
      closeLibro();
    } catch (error: any) {
      showAlert(error.message || "Error al guardar el libro.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────── Filtrado ─────────
  const filteredLibros = useMemo(() => {
    return libros.filter((libro) => {
      const autorStr   = libro.autor  || "";
      const unidadStr  = libro.unidad || "";
      const tituloStr  = libro.titulo || "";
      const catStr     = libro.categoria || "";
      const matchesSearch =
        tituloStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidadStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        autorStr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === "Todos" || libro.estado === filterEstado;
      const matchesCategoria = filterCategoria === "Todas" || catStr === filterCategoria;
      const matchesAutor = filterAutor === "Todos" || autorStr === filterAutor;
      return matchesSearch && matchesEstado && matchesCategoria && matchesAutor;
    });
  }, [libros, searchTerm, filterEstado, filterCategoria, filterAutor]);

  const filteredPrestamos = useMemo(() => {
    if (!searchCedula.trim()) return prestamos.filter(p => p.estado === "ACTIVO");
    return prestamos.filter(p =>
      p.cedulaSolicitante.toLowerCase().includes(searchCedula.toLowerCase())
    );
  }, [prestamos, searchCedula]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      // Las fechas DATEONLY de Postgres vienen como "YYYY-MM-DD", se muestra directamente
      return dateStr.substring(0, 10);
    } catch {
      return dateStr;
    }
  };

  // ───────── Input class helper ─────────
  const inputCls =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="space-y-6 relative">

      {/* ── Floating Alert ── */}
      {alertInfo.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md ${
              alertInfo.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span className="font-semibold text-sm">
              {alertInfo.type === "success" ? "✅" : "⚠️"} {alertInfo.message}
            </span>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario de Biblioteca</h1>
          <p className="text-sm text-gray-500">Gestión de libros, catálogos y préstamos en sala.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportarCatalogoBiblioteca}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar PDF
          </button>
          <button
            onClick={handleOpenAddLibro}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Registrar Nuevo Libro
          </button>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* Barra búsqueda / filtros */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por unidad, título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Estado:</span>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="Todos">Todos</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Descartado/Venta">Descartado/Venta</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Categoría:</span>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none min-w-[140px]"
            >
              <option value="Todas">Todas</option>
              {categorias.map((c: any) => (
                <option key={c.id_categoria} value={c.nombre_categoria}>{c.nombre_categoria}</option>
              ))}
            </select>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Autor:</span>
            <select
              value={filterAutor}
              onChange={(e) => setFilterAutor(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none min-w-[160px]"
            >
              <option value="Todos">Todos</option>
              {autores.map((a: any) => (
                <option key={a.id_autor} value={`${a.nombre} ${a.apellido}`}>
                  {a.nombre} {a.apellido}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando catálogo...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-3">Unidad</th>
                    <th className="px-3 py-3">Título</th>
                    <th className="px-3 py-3">Autor</th>
                    <th className="px-3 py-3">Estante</th>
                    <th className="px-3 py-3">Categoría</th>
                    <th className="px-3 py-3 text-center">Estado</th>
                    <th className="px-3 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredLibros.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-base font-medium">No se encontraron libros</p>
                        <p className="text-sm text-gray-400 mt-1">Prueba con otro término de búsqueda o registra un nuevo libro.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLibros.map((libro) => (
                      <tr 
                        key={libro.id} 
                        onClick={() => setSelectedLibroForDetail(libro)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                      >
                        {/* Unidad */}
                        <td className="px-3 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">
                          {libro.unidad || "—"}
                        </td>

                        {/* Título */}
                        <td className="px-3 py-3 font-semibold max-w-[250px]">
                          <span className="block truncate" title={libro.titulo}>{libro.titulo}</span>
                        </td>

                        {/* Autor */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                          {libro.autor}
                        </td>

                        {/* Estante */}
                        <td className="px-3 py-3 text-gray-500 dark:text-gray-400">
                          {libro.estante || "—"}
                        </td>

                        {/* Categoría */}
                        <td className="px-3 py-3">
                          {libro.categoria ? (
                            <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-500/30">
                              {libro.categoria}
                            </span>
                          ) : "—"}
                        </td>

                        {/* Estado */}
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              libro.estado === "Aprobado"
                                ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30"
                                : libro.estado === "Pendiente"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30"
                                : "bg-red-100 text-red-800 border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30"
                            }`}
                          >
                            {libro.estado}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenPrestamo(libro.id, libro.titulo)}
                              disabled={libro.estado === "Descartado/Venta" || libro.cantidad_disponible <= 0}
                              className={`font-semibold text-xs border px-2 py-1 rounded transition w-18 ${
                                libro.estado === "Descartado/Venta" || libro.cantidad_disponible <= 0
                                  ? "text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
                                  : "text-brand-600 border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                              }`}
                            >
                              Prestar
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm("¿Marcar como devuelto?")) {
                                  try {
                                    const result = await mavetApi.devolverLibro(libro.id);
                                    showAlert(result.message, "success");
                                    await fetchDatos();
                                  } catch (e: any) {
                                    showAlert(e.message || "Error al devolver.", "error");
                                  }
                                }
                              }}
                              disabled={libro.estado === "Descartado/Venta" || libro.cantidad_disponible >= libro.cantidad_total}
                              className="font-semibold text-xs border px-2 py-1 rounded transition w-18 text-green-600 border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Devolver
                            </button>
                            <div className="h-4 w-[1px] bg-gray-250 dark:bg-gray-700 mx-1"></div>
                            <button
                              onClick={() => handleEditLibro(libro)}
                              className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded transition-colors"
                              title="Editar libro"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteLibro(libro.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                              title="Eliminar libro"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mt-auto">
              <span>
                Mostrando <span className="font-semibold">{filteredLibros.length}</span> de{" "}
                <span className="font-semibold">{libros.length}</span> libros
              </span>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════
          Sección: Control de Préstamos por Cédula
         ══════════════════════════════════════════ */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white text-base">Control de Préstamos por Cédula</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Busque por cédula para ver el historial de préstamos de una persona</p>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar por cédula..."
              value={searchCedula}
              onChange={(e) => setSearchCedula(e.target.value)}
              className="pl-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-3">Cédula</th>
                <th className="px-3 py-3">Solicitante</th>
                <th className="px-3 py-3">Libro</th>
                <th className="px-3 py-3">Unidad</th>
                <th className="px-3 py-3">Fecha Préstamo</th>
                <th className="px-3 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPrestamos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                    <p className="text-sm font-medium">
                      {searchCedula.trim() ? "No se encontraron préstamos para esta cédula." : "No hay préstamos activos."}
                    </p>
                  </td>
                </tr>
              ) : filteredPrestamos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-3 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">
                    {p.cedulaSolicitante}
                  </td>
                  <td className="px-3 py-3 font-medium">{p.nombreSolicitante}</td>
                  <td className="px-3 py-3 max-w-[200px]">
                    <span className="block truncate" title={p.libroTitulo}>{p.libroTitulo}</span>
                  </td>
                  <td className="px-3 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{p.libroUnidad || "—"}</td>
                  <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {p.fechaPrestamo ? new Date(p.fechaPrestamo).toLocaleDateString('es-ES') : "—"}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      p.estado === "ACTIVO"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
                        : "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        p.estado === "ACTIVO" ? "bg-amber-500 animate-pulse" : "bg-green-500"
                      }`}></span>
                      {p.estado === "ACTIVO" ? "Activo" : "Devuelto"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>
            {searchCedula.trim()
              ? `${filteredPrestamos.length} resultado(s) para "${searchCedula}"`
              : `${filteredPrestamos.length} préstamo(s) activo(s)`
            }
          </span>
          {!searchCedula.trim() && (
            <span className="text-gray-400">Utilice el buscador para consultar por cédula</span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          Modal 1: Formulario de Libro (Crear / Editar)
         ══════════════════════════════════════════ */}
      <Modal isOpen={isLibroOpen} onClose={closeLibro} className="max-w-[620px] p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
            {isEditing ? "Editar Libro" : "Registrar Nuevo Libro"}
          </h3>
          {isEditing && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Unidad: <span className="font-semibold text-brand-600">{libroFormData.unidad || libroFormData.id}</span>
            </p>
          )}
          {!isEditing && <div className="mb-4" />}

          <form onSubmit={handleLibroSubmit} className="space-y-3">
            {/* Fila 1: Título + Cuota */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={libroFormData.titulo}
                  onChange={handleLibroChange}
                  placeholder="Nombre del libro"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cuota (Nº Catalogación)
                </label>
                <input
                  type="text"
                  name="cuota"
                  value={libroFormData.cuota || ""}
                  onChange={handleLibroChange}
                  placeholder="Ej. 823.914 BEC"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Fila 2: Unidad + Estante */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unidad (Código de unidad)
                </label>
                <input
                  type="text"
                  name="unidad"
                  value={libroFormData.unidad || ""}
                  onChange={handleLibroChange}
                  placeholder="Ej. BIB-001"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estante / Ubicación Física
                </label>
                <input
                  type="text"
                  name="estante"
                  value={libroFormData.estante || ""}
                  onChange={handleLibroChange}
                  placeholder="Ej. Estante A - Fila 2"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Fila 3: Autor + Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Autor <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_autor"
                  value={libroFormData.id_autor || ""}
                  onChange={handleLibroChange}
                  className={inputCls}
                  required
                >
                  <option value="" disabled>Seleccione un autor...</option>
                  {autores.map((a: any) => (
                    <option key={a.id_autor} value={a.id_autor}>
                      {a.nombre} {a.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_categoria"
                  value={libroFormData.id_categoria || ""}
                  onChange={handleLibroChange}
                  className={inputCls}
                  required
                >
                  <option value="" disabled>Seleccione una categoría...</option>
                  {categorias.map((c: any) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 4: Año + Fecha Ingreso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Año del Libro
                </label>
                <input
                  type="number"
                  name="ano_libro"
                  value={libroFormData.ano_libro || ""}
                  onChange={handleLibroChange}
                  placeholder="Ej. 2023"
                  min={1000}
                  max={2099}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  name="fecha_ingreso"
                  value={libroFormData.fecha_ingreso || today}
                  onChange={handleLibroChange}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Fila 5: Cantidad Total + Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cantidad Total (Ejemplares) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cantidad_total"
                  value={libroFormData.cantidad_total}
                  onChange={handleLibroChange}
                  min={1}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </label>
                <select
                  name="estado"
                  value={libroFormData.estado}
                  onChange={handleLibroChange}
                  className={inputCls}
                >
                  <option value="Aprobado">Aprobado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Descartado/Venta">Descartado/Venta</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={closeLibro}
                className="px-4 py-1.5 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isEditing ? (
                  "Actualizar Libro"
                ) : (
                  "Registrar Libro"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════
          Modal 2: Registrar Préstamo
         ══════════════════════════════════════════ */}
      <Modal isOpen={isPrestamoOpen} onClose={closePrestamo} className="max-w-md p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Registrar Préstamo</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Libro:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedLibroTitle}</span>
          </p>
          <form onSubmit={handlePrestamoSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Cédula del Solicitante
              </label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                disabled={isSubmitting}
                className={inputCls + " disabled:opacity-50"}
                placeholder="V-12345678"
                required
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Solicitante
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isSubmitting}
                className={inputCls + " disabled:opacity-50"}
                placeholder="Ej. María López"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700 mt-4">
              <button
                type="button"
                onClick={closePrestamo}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center min-w-[150px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirmar Préstamo"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Detalle (Ficha de Libro) */}
      <Modal
        isOpen={selectedLibroForDetail !== null}
        onClose={() => setSelectedLibroForDetail(null)}
        showCloseButton={false}
        className="max-w-3xl p-0 overflow-hidden"
      >
        {selectedLibroForDetail && (
          <div className="flex flex-col md:flex-row min-h-[420px]">
            {/* Columna Izquierda: Ficha Visual */}
            <div 
              className="md:w-[280px] w-full bg-brand-950 p-5 flex flex-col items-center justify-between relative text-white"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            >
              {/* Encabezado Ficha */}
              <div className="w-full flex justify-between text-[11px] font-semibold tracking-wider text-brand-300">
                <span>{selectedLibroForDetail.unidad || selectedLibroForDetail.id}</span>
                <span>BIBLIOTECA</span>
              </div>

              {/* Contenedor Ficha de Libro */}
              <div className="w-44 h-56 my-6 border border-brand-800/60 bg-brand-950/40 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center relative p-4 group overflow-hidden">
                {/* Esquinas Reforzadas */}
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-brand-400"></div>
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-brand-400"></div>
                <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-brand-400"></div>
                <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-brand-400"></div>

                <div className="flex flex-col items-center justify-center">
                  <svg className="w-10 h-10 text-brand-400/80 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-semibold text-[11px] tracking-wider text-brand-100 uppercase text-center">Ficha de Libro</span>
                  <span className="text-[9px] text-brand-300/60 tracking-widest uppercase mt-1 text-center font-serif">Colección MAVET</span>
                </div>
              </div>

              {/* Pie Ficha */}
              <div className="text-center">
                <p className="text-xs font-semibold tracking-widest text-brand-300">MAVET</p>
                <p className="text-[9px] text-brand-400/60 mt-0.5">Museo de Artes Visuales y del Espacio</p>
              </div>
            </div>

            {/* Columna Derecha: Datos */}
            <div className="flex-1 p-6 bg-[#fcfafa] dark:bg-gray-900 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                      {selectedLibroForDetail.titulo}
                    </h2>
                    <p className="text-brand-500 dark:text-brand-400 font-semibold text-xs mt-1">
                      • {selectedLibroForDetail.autor}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedLibroForDetail(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tarjeta Estado del Libro */}
                <div className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm my-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado del Ejemplar</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Estatus de Catálogo</span>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                    selectedLibroForDetail.estado === 'Aprobado' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' :
                    selectedLibroForDetail.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/40' :
                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    {selectedLibroForDetail.estado}
                  </span>
                </div>

                {/* Grilla de Parámetros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                  {/* Código de Unidad */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Código de Unidad</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedLibroForDetail.unidad || '—'}</span>
                    </div>
                  </div>

                  {/* Cuota Catalogación */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nº Catalogación (Cuota)</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedLibroForDetail.cuota || '—'}</span>
                    </div>
                  </div>

                  {/* Estante */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ubicación Física (Estante)</span>
                      <span className="text-xs font-semibold text-gray-855 dark:text-gray-200">{selectedLibroForDetail.estante || '—'}</span>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categoría</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{selectedLibroForDetail.categoria || '—'}</span>
                    </div>
                  </div>

                  {/* Año del Libro */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Año de Publicación</span>
                      <span className="text-xs font-semibold text-gray-855 dark:text-gray-205">{selectedLibroForDetail.ano_libro ? String(selectedLibroForDetail.ano_libro).substring(0, 4) : '—'}</span>
                    </div>
                  </div>

                  {/* Fecha de ingreso */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha de Registro</span>
                      <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{formatDate(selectedLibroForDetail.fecha_ingreso)}</span>
                    </div>
                  </div>

                  {/* Disponibilidad */}
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-outfit">Cantidad y Disponibilidad en Sala</span>
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          selectedLibroForDetail.cantidad_disponible <= 0 
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' 
                            : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400'
                        }`}>
                          {selectedLibroForDetail.cantidad_disponible} disponibles de {selectedLibroForDetail.cantidad_total} ejemplares
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones del pie */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setSelectedLibroForDetail(null)}
                  className="px-5 py-2 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleEditLibro(selectedLibroForDetail);
                    setSelectedLibroForDetail(null);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Libro
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
