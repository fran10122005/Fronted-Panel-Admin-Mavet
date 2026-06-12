import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { exportarCatalogoBiblioteca } from "../../services/pdf.service";
import { Libro, PrestamoPayload } from "../../types";

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

  // Modal Prestamo
  const [selectedLibroId, setSelectedLibroId] = useState<string>("");
  const [selectedLibroTitle, setSelectedLibroTitle] = useState<string>("");
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Libro
  const [libroFormData, setLibroFormData] = useState<Libro>(initialLibroState);
  const [isEditing, setIsEditing] = useState(false);

  // Alert
  const [alertInfo, setAlertInfo] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  // ───────── Carga de datos ─────────
  const fetchDatos = async () => {
    setIsLoading(true);
    try {
      const [librosData, autoresData, catData] = await Promise.all([
        mavetApi.getLibros(),
        mavetApi.getAutoresLibro(),
        mavetApi.getCategoriasLibro(),
      ]);
      setLibros(librosData);
      setAutores(autoresData);
      setCategorias(catData);
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
      const matchesSearch =
        tituloStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidadStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        autorStr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === "Todos" || libro.estado === filterEstado;
      return matchesSearch && matchesEstado;
    });
  }, [libros, searchTerm, filterEstado]);

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
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Estado:</span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Descartado/Venta">Descartado/Venta</option>
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
              <table className="w-full text-left border-collapse" style={{ minWidth: "1300px" }}>
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-3 whitespace-nowrap">Unidad</th>
                    <th className="px-3 py-3 whitespace-nowrap">Cuota</th>
                    <th className="px-3 py-3 whitespace-nowrap">Título</th>
                    <th className="px-3 py-3 whitespace-nowrap">Autor</th>
                    <th className="px-3 py-3 whitespace-nowrap">Estante</th>
                    <th className="px-3 py-3 whitespace-nowrap text-center">Año</th>
                    <th className="px-3 py-3 whitespace-nowrap">Categoría</th>
                    <th className="px-3 py-3 whitespace-nowrap text-center">Cant.</th>
                    <th className="px-3 py-3 whitespace-nowrap text-center">Estado</th>
                    <th className="px-3 py-3 whitespace-nowrap">Fecha Ingreso</th>
                    <th className="px-3 py-3 whitespace-nowrap text-center">Préstamo</th>
                    <th className="px-3 py-3 whitespace-nowrap text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLibros.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-5 py-14 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-base font-medium">No se encontraron libros</p>
                        <p className="text-sm text-gray-400 mt-1">Prueba con otro término de búsqueda o registra un nuevo libro.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLibros.map((libro) => (
                      <tr key={libro.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">

                        {/* Unidad */}
                        <td className="px-3 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold whitespace-nowrap">
                          {libro.unidad || "—"}
                        </td>

                        {/* Cuota */}
                        <td className="px-3 py-3 font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {libro.cuota || "—"}
                        </td>

                        {/* Título */}
                        <td className="px-3 py-3 font-semibold max-w-[200px]">
                          <span className="block truncate" title={libro.titulo}>{libro.titulo}</span>
                        </td>

                        {/* Autor */}
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {libro.autor}
                        </td>

                        {/* Estante */}
                        <td className="px-3 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {libro.estante || "—"}
                        </td>

                        {/* Año */}
                        <td className="px-3 py-3 text-center whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {libro.ano_libro ? String(libro.ano_libro).substring(0, 4) : "—"}
                        </td>

                        {/* Categoría */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {libro.categoria ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-500/30">
                              {libro.categoria}
                            </span>
                          ) : "—"}
                        </td>

                        {/* Cantidad */}
                        <td className="px-3 py-3 text-center font-semibold">
                          {libro.cantidad_total}
                        </td>

                        {/* Estado */}
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${
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

                        {/* Fecha Ingreso */}
                        <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(libro.fecha_ingreso)}
                        </td>

                        {/* Préstamo */}
                        <td className="px-3 py-3 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <button
                              onClick={() => handleOpenPrestamo(libro.id, libro.titulo)}
                              disabled={libro.estado === "Descartado/Venta"}
                              className={`font-semibold text-xs border px-2 py-1 rounded transition w-20 ${
                                libro.estado === "Descartado/Venta"
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
                                  } catch (e: any) {
                                    showAlert(e.message || "Error al devolver.", "error");
                                  }
                                }
                              }}
                              disabled={libro.estado === "Descartado/Venta"}
                              className="font-semibold text-xs border px-2 py-1 rounded transition w-20 text-green-600 border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Devolver
                            </button>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditLibro(libro)}
                              className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded transition-colors"
                              title="Editar libro"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteLibro(libro.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                              title="Eliminar libro"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          Modal 1: Formulario de Libro (Crear / Editar)
         ══════════════════════════════════════════ */}
      <Modal isOpen={isLibroOpen} onClose={closeLibro} className="max-w-[820px] p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {isEditing ? "Editar Libro" : "Registrar Nuevo Libro"}
          </h3>
          {isEditing && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Unidad: <span className="font-semibold text-brand-600">{libroFormData.unidad || libroFormData.id}</span>
            </p>
          )}
          {!isEditing && <div className="mb-6" />}

          <form onSubmit={handleLibroSubmit} className="space-y-4">

            {/* Fila 1: Título + Cuota */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={closeLibro}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center min-w-[160px] px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                className="flex items-center justify-center min-w-[150px] px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirmar Préstamo"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
