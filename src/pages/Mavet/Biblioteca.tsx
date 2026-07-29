import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { useLibros, ITEMS_PER_PAGE } from "../../hooks/useLibros";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/button/Button";
import TextField from "../../components/ui/TextField";
import Badge from "../../components/ui/Badge";
import { exportarCatalogoBiblioteca } from "../../services/pdf.service";
import LibroFormModal from "./biblioteca/LibroFormModal";
import ConsultaFormModal from "./biblioteca/PrestamoFormModal";
import LibroDetailModal from "./biblioteca/LibroDetailModal";
import { useAuth, getUserRole } from "../../context/AuthContext";
import type {
  ConsultaSalaFiltrada,
  ConsultasFiltradasResponse,
  EstadisticasBiblioteca,
} from "../../types";
import { mavetApi } from "../../services/api";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/ui/Tabs";

type Periodo = "todas" | "hoy" | "semana" | "mes" | "personalizado";
type Tab = "inventario" | "consultas";

import { inputCls, selectCls } from "../../utils/formClasses";

const estadoScheme: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  Aprobado: "success",
  Pendiente: "warning",
  "Descartado/Venta": "danger",
};

export default function Biblioteca() {
  const { user } = useAuth();
  const userRole = getUserRole(user);

  const canPrestarDevolver = userRole === "Administrador" || userRole === "admin" || userRole === "Bibliotecario" || userRole === "Bibliotecaria" || userRole === "Gerente";
  const canEditLibro = userRole === "Administrador" || userRole === "admin" || userRole === "Bibliotecario" || userRole === "Bibliotecaria" || userRole === "Gerente";
  const canDeleteLibro = userRole === "Administrador" || userRole === "admin" || userRole === "Gerente";

  const {
    categorias, isLoading,
    searchTerm, setSearchTerm,
    filterEstado, setFilterEstado,
    filterCategoria, setFilterCategoria,
    filterAutor, setFilterAutor,
    searchCedula, setSearchCedula,
    currentPage, totalPages, totalItems,
    filteredLibros, filteredPrestamos: filteredConsultas,
    setPrestamos: setConsultas,
    isPrestamoOpen: isConsultaOpen, closePrestamo: closeConsulta,
    isLibroOpen, closeLibro,
    selectedLibroTitle, selectedLibroCantidad,
    isSubmitting,
    libroFormData, isEditing,
    selectedLibroForDetail, setSelectedLibroForDetail,
    confirm, setConfirm,
    goToPage, handleOpenPrestamo: handleOpenConsulta, handlePrestamoSubmit: handleConsultaSubmit,
    handleOpenAddLibro, handleEditLibro, handleDeleteLibro,
    sortConfig, setSortConfig, handleSort,
    handleLibroSubmit,
    customCategoria,
    autorNombre, autorApellido,
    formError,
  } = useLibros();

  const [activeTab, setActiveTab] = useState<Tab>("inventario");
  const [searchParams, setSearchParams] = useSearchParams();

  // Manejar apertura automática desde código QR o enlace directo
  useEffect(() => {
    if (!isLoading && filteredLibros && filteredLibros.length > 0) {
      const id = searchParams.get("id");
      if (id) {
        const libro = filteredLibros.find((l: any) => String(l.id) === id || String(l.unidad) === id);
        if (libro) {
          setSelectedLibroForDetail(libro);
          // Opcional: limpiar la URL después de abrir
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("id");
          setSearchParams(newParams, { replace: true });
        }
      }
    }
  }, [isLoading, filteredLibros, searchParams, setSearchParams, setSelectedLibroForDetail]);

  const toastMessage = (type: "success" | "error", msg: string) => {
    import("react-hot-toast").then(m => m.default[type](msg));
  };

  const handleReturnBook = async (libroId: string) => {
    try {
      const { mavetApi } = await import("../../services/api");
      const result = await mavetApi.devolverLibro(libroId);
      toastMessage("success", result.message);
      goToPage(currentPage);
      const consultasRes = await mavetApi.getPrestamosBiblioteca();
      setConsultas(consultasRes);
    } catch (e: any) {
      toastMessage("error", e.message || "Error al devolver.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Biblioteca"
        subtitle="Gestión de libros, consultas en sala y registro de consultas."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={exportarCatalogoBiblioteca}
              startIcon={<svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
              <span className="hidden sm:inline">Exportar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            {canEditLibro && (
              <Button size="sm" onClick={handleOpenAddLibro}
                startIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}>
                <span className="hidden sm:inline">Registrar Nuevo Libro</span>
                <span className="sm:hidden">Nuevo Libro</span>
              </Button>
            )}
          </>
        }
      />

      <Tabs
        variant="underline"
        tabs={[
          { id: "inventario", label: "Inventario y Consultas", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
          { id: "consultas", label: "Registro de Consultas", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as Tab)}
      />

      {activeTab === "inventario" ? (
        <>
          {/* ── Tabla de Inventario ── */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col">

            {/* Barra búsqueda / filtros */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col gap-3">
              <div className="relative w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input type="text" placeholder="Buscar por unidad, título o autor..."
                  aria-label="Buscar libro"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className={inputCls} />
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Estado:</span>
                  <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:text-white/90">
                    <option value="Todos">Todos</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Descartado/Venta">Descartado/Venta</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Categoría:</span>
                  <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:text-white/90">
                    <option value="Todas">Todas</option>
                    {categorias.map((c: any) => (
                      <option key={c.id_categoria} value={c.nombre_categoria}>{c.nombre_categoria}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Autor:</span>
                  <input type="text" value={filterAutor === "Todos" ? "" : filterAutor}
                    onChange={(e) => setFilterAutor(e.target.value || "Todos")} placeholder="Buscar..."
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:text-white/90 w-24 sm:w-32" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Orden:</span>
                  <select value={sortConfig ? `${sortConfig.key}_${sortConfig.direction}` : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) { setSortConfig(null); return; }
                      const [key, direction] = val.split("_");
                      setSortConfig({ key, direction: direction as "asc" | "desc" });
                    }}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:text-white/90">
                    <option value="">Ord. predet.</option>
                    <option value="unidad_asc">ID ↑</option>
                    <option value="unidad_desc">ID ↓</option>
                  </select>
                </div>
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
                        <th className="px-2 py-2.5">Unidad</th>
                        <th className="px-2 py-2.5">Título</th>
                        <th className="px-2 py-2.5">Autor</th>
                        <th className="px-2 py-2.5">Estante</th>
                        <th className="px-2 py-2.5">Categoría</th>
                        <th className="px-2 py-2.5 text-center">Cant. Disp.</th>
                        <th className="px-2 py-2.5 text-center">Estado</th>
                        <th className="px-2 py-2.5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredLibros.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                            <svg className="mx-auto h-10 w-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-sm font-medium">No se encontraron libros</p>
                            <p className="text-xs text-gray-400 mt-1">Prueba con otro término de búsqueda o registra un nuevo libro.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredLibros.map((libro) => (
                          <tr key={libro.id} onClick={() => setSelectedLibroForDetail(libro)}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors">
                            <td className="px-2 py-2.5 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">
                              {libro.unidad || "—"}
                            </td>
                            <td className="px-2 py-2.5 font-semibold max-w-[200px]">
                              <span className="block truncate" title={libro.titulo}>{libro.titulo}</span>
                            </td>
                            <td className="px-2 py-2.5 text-gray-700 dark:text-gray-300 text-xs">{libro.autor}</td>
                            <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{libro.estante || "—"}</td>
                            <td className="px-2 py-2.5">
                              {libro.categoria ? (
                                <Badge scheme="info">{libro.categoria}</Badge>
                              ) : "—"}
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              <Badge scheme={Number(libro.cantidad_disponible) === 0 ? "danger" : "neutral"}>
                                {libro.cantidad_disponible}/{libro.cantidad_total}
                              </Badge>
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              <Badge scheme={estadoScheme[libro.estado] || "neutral"} dot pulse={libro.estado === "Pendiente"}>
                                {libro.estado}
                              </Badge>
                            </td>
                            <td className="px-2 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                {canPrestarDevolver && (
                                  <>
                                    {libro.cantidad_disponible > 0 && (
                                      <Button variant="ghost" size="xs"
                                        onClick={() => handleOpenConsulta(libro.id, libro.titulo, Number(libro.cantidad_disponible))}
                                        disabled={libro.estado === "Descartado/Venta"}
                                        className="text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10">
                                        Consultar
                                      </Button>
                                    )}
                                    {libro.cantidad_disponible < libro.cantidad_total && (
                                      <Button variant="ghost" size="xs"
                                        onClick={() => setConfirm({
                                          open: true,
                                          title: "Devolver libro",
                                          message: "¿Marcar como devuelto?",
                                          variant: "info",
                                          confirmLabel: "Devolver",
                                          onConfirm: async () => {
                                            setConfirm(prev => ({ ...prev, open: false }));
                                            handleReturnBook(libro.id);
                                          },
                                        })}
                                        disabled={libro.estado === "Descartado/Venta"}
                                        className="text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10">
                                        Devolver
                                      </Button>
                                    )}
                                    {(libro.cantidad_disponible > 0 || libro.cantidad_disponible < libro.cantidad_total) && (canEditLibro || canDeleteLibro) && (
                                      <div className="h-4 w-[1px] bg-gray-250 dark:bg-gray-700 mx-1"></div>
                                    )}
                                  </>
                                )}
                                {canEditLibro && (
                                  <Button variant="ghost" size="xs" onClick={() => handleEditLibro(libro)}
                                    title="Editar libro" className="text-gray-500 hover:text-brand-600"
                                    startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}>Editar</Button>
                                )}
                                {canDeleteLibro && (
                                  <Button variant="ghost" size="xs" onClick={() => handleDeleteLibro(libro.id)}
                                    title="Eliminar libro" className="text-gray-500 hover:text-red-600"
                                    startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}>Eliminar</Button>
                                )}
                                {!canPrestarDevolver && !canEditLibro && !canDeleteLibro && (
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

                {/* Footer */}
                <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages || 1}
                    totalItems={totalItems}
                    pageSize={ITEMS_PER_PAGE}
                    label="libros"
                    onPageChange={goToPage}
                  />
                </div>
              </>
            )}
          </div>

          {/* Control de Consultas por Cédula */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-base">Control de Consultas por Cédula</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Busque por cédula para ver el historial de consultas de una persona</p>
              </div>
              <div className="relative w-full sm:w-64">
                <input type="text" placeholder="Buscar por cédula..." value={searchCedula}
                  aria-label="Buscar por cédula"
                  onChange={(e) => setSearchCedula(e.target.value)}
                  className={inputCls} />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-2.5">Cédula</th>
                    <th className="px-2 py-2.5">Solicitante</th>
                    <th className="px-2 py-2.5">Libro</th>
                    <th className="px-2 py-2.5">Unidad</th>
                    <th className="px-2 py-2.5 text-center">Estado</th>
                    <th className="px-2 py-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredConsultas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-5 text-center text-gray-500">
                        <p className="text-sm font-medium">
                          {searchCedula.trim() ? "No se encontraron consultas para esta cédula." : "No hay consultas activas."}
                        </p>
                      </td>
                    </tr>
                    ) : filteredConsultas.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-2 py-2.5 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">{p.cedulaSolicitante}</td>
                      <td className="px-2 py-2.5 font-medium text-xs">{p.nombreSolicitante}</td>
                      <td className="px-2 py-2.5 max-w-[180px]">
                        <span className="block truncate text-xs" title={p.libroTitulo}>{p.libroTitulo}</span>
                      </td>
                      <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400 font-mono text-xs">{p.libroUnidad || "—"}</td>
                      <td className="px-2 py-2.5 text-center">
                        <Badge scheme={p.estado === "ACTIVO" ? "warning" : "success"} dot pulse={p.estado === "ACTIVO"}>
                          {p.estado === "ACTIVO" ? "En lectura" : "Devuelto"}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        {p.estado === "ACTIVO" && canPrestarDevolver ? (
                          <Button variant="ghost" size="xs" className="text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"
                            onClick={() => setConfirm({
                              open: true,
                              title: "Devolver libro",
                              message: `¿Marcar como devuelta la consulta de "${p.libroTitulo}" por ${p.nombreSolicitante}?`,
                              variant: "info",
                              confirmLabel: "Devolver",
                              onConfirm: async () => {
                                setConfirm(prev => ({ ...prev, open: false }));
                                handleReturnBook(p.libroId);
                              },
                            })}>
                            Devolver
                          </Button>
                        ) : p.estado === "DEVUELTO" ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>
                {searchCedula.trim()
                  ? `${filteredConsultas.length} resultado(s) para "${searchCedula}"`
                  : `${filteredConsultas.length} consulta(s) activa(s)`
                }
              </span>
              {!searchCedula.trim() && (
                <span className="text-gray-400">Utilice el buscador para consultar por cédula</span>
              )}
            </div>
          </div>

          <LibroFormModal
            isOpen={isLibroOpen}
            onClose={closeLibro}
            isEditing={isEditing}
            initialData={{ ...libroFormData, autorNombre, autorApellido, customCategoria }}
            categorias={categorias}
            isSubmitting={isSubmitting}
            formError={formError}
            onSubmit={handleLibroSubmit}
            inputCls={inputCls}
          />

          <ConsultaFormModal
            isOpen={isConsultaOpen}
            onClose={closeConsulta}
            selectedLibroTitle={selectedLibroTitle}
            maxCantidad={selectedLibroCantidad}
            isSubmitting={isSubmitting}
            onSubmit={handleConsultaSubmit}
            inputCls={inputCls}
          />

          <LibroDetailModal
            libro={selectedLibroForDetail}
            onClose={() => setSelectedLibroForDetail(null)}
            onEdit={handleEditLibro}
          />

          <ConfirmDialog
            open={confirm.open}
            title={confirm.title}
            message={confirm.message}
            variant={confirm.variant}
            confirmLabel={confirm.confirmLabel}
            cancelLabel={confirm.cancelLabel}
            onConfirm={confirm.onConfirm}
            onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
          />
        </>
      ) : (
        <ConsultasTab />
      )}
    </div>
  );
}

function ConsultasTab() {
  const [periodo, setPeriodo] = useState<Periodo>("todas");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [consultas, setConsultas] = useState<ConsultasFiltradasResponse>({
    data: [],
    meta: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasBiblioteca>({
    topLibros: [],
    topLectores: [],
    totalLectores: 0,
    totales: { hoy: 0, semana: 0, mes: 0, activas: 0, devueltas: 0 },
  });

  const fetchConsultas = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (periodo === "personalizado") {
        if (fechaDesde) params.fecha_desde = fechaDesde;
        if (fechaHasta) params.fecha_hasta = fechaHasta;
      } else if (periodo !== "todas") {
        params.periodo = periodo;
      }
      if (estadoFilter) params.estado = estadoFilter;

      const result = await mavetApi.getConsultasFiltradas(params);
      setConsultas(result);
    } catch {
      setConsultas({ data: [], meta: null });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, periodo, fechaDesde, fechaHasta, estadoFilter]);

  useEffect(() => {
    fetchConsultas();
    mavetApi.getEstadisticasBiblioteca(5).then(setEstadisticas).catch(() => {});
  }, [fetchConsultas]);

  const handlePeriodoChange = (p: Periodo) => {
    setPeriodo(p);
    setPage(1);
    if (p !== "personalizado") {
      setFechaDesde("");
      setFechaHasta("");
    }
  };

  const meta = consultas.meta;
  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const formatFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "—";
    const d = new Date(fechaStr);
    return d.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statsCards = [
    { label: "Consultas Hoy", value: estadisticas.totales.hoy, scheme: "info" as const },
    { label: "Esta Semana", value: estadisticas.totales.semana, scheme: "brand" as const },
    { label: "Este Mes", value: estadisticas.totales.mes, scheme: "warning" as const },
    { label: "En lectura", value: estadisticas.totales.activas, scheme: "danger" as const },
    { label: "Devueltas", value: estadisticas.totales.devueltas, scheme: "success" as const },
  ];

  return (
    <>
      {/* ── Estadísticas ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="font-bold text-gray-800 dark:text-white text-base">Estadísticas de Consultas</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Resumen de actividad en sala de lectura</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
            {statsCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex flex-col items-center text-center">
                <Badge scheme={card.scheme} className="text-lg font-bold px-3 py-1 mb-1">
                  {card.value}
                </Badge>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Filtrar por</h3>

        <div className="flex flex-wrap gap-2">
          {(["todas", "hoy", "semana", "mes", "personalizado"] as Periodo[]).map((p) => (
            <Button key={p} size="sm"
              variant={periodo === p ? "primary" : "secondary"}
              onClick={() => handlePeriodoChange(p)} className="capitalize">
              {p === "todas" ? "Todas" : p === "hoy" ? "Hoy" : p === "semana" ? "Esta Semana" : p === "mes" ? "Este Mes" : "Por Fecha"}
            </Button>
          ))}
        </div>

        {periodo === "personalizado" && (
          <div className="flex flex-wrap items-end gap-3 pt-1">
            <TextField label="Desde" type="date" value={fechaDesde}
              onChange={(e) => { setFechaDesde(e.target.value); setPage(1); }} />
            <TextField label="Hasta" type="date" value={fechaHasta}
              onChange={(e) => { setFechaHasta(e.target.value); setPage(1); }} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado:</span>
          <select value={estadoFilter} onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-2 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90">
            <option value="">Todos</option>
            <option value="ACTIVO">En lectura</option>
            <option value="Devuelto">Devuelto</option>
          </select>

          <Button size="sm" onClick={() => { setPage(1); fetchConsultas(); }}
            className="ml-auto">
            Buscar
          </Button>
        </div>
      </div>

      {/* ── Tabla de consultas ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Cargando registros...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-2.5">Persona</th>
                    <th className="px-2 py-2.5">Cédula</th>
                    <th className="px-2 py-2.5">Libro</th>
                    <th className="px-2 py-2.5">Fecha Consulta</th>
                    <th className="px-2 py-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                  {consultas.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-base font-medium">No se encontraron consultas</p>
                        <p className="text-sm text-gray-400 mt-1">Presiona "Buscar" para ver los registros.</p>
                      </td>
                    </tr>
                  ) : (
                    consultas.data.map((c: ConsultaSalaFiltrada) => (
                      <tr key={c.id_consulta} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-2 py-2.5 font-medium text-xs">
                          {c.Persona ? `${c.Persona.nombres} ${c.Persona.apellidos}` : "—"}
                        </td>
                        <td className="px-2 py-2.5 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">
                          {c.Persona?.cedula || "—"}
                        </td>
                        <td className="px-2 py-2.5 max-w-[180px]">
                          <span className="block truncate text-xs" title={c.Libro?.titulo || ""}>
                            {c.Libro?.titulo || "—"}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                          {formatFecha(c.hora_entrega)}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <Badge scheme={c.estado?.toUpperCase() === "ACTIVO" ? "warning" : "success"} dot pulse={c.estado?.toUpperCase() === "ACTIVO"}>
                            {c.estado?.toUpperCase() === "ACTIVO" ? "En lectura" : "Devuelto"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={limit}
                label="registros"
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </div>

      {/* Top Lectores + Top Libros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Lectores más frecuentes
          </h4>
          {estadisticas.topLectores.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Sin datos de lectores</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {estadisticas.topLectores.map((lector, i) => (
                <div key={lector.id_persona} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {lector.nombres} {lector.apellidos}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{lector.cedula}</p>
                    </div>
                  </div>
                  <Badge scheme="brand">{lector.total_consultas}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Libros más consultados
          </h4>
          {estadisticas.topLibros.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Sin datos de libros</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {estadisticas.topLibros.map((libro, i) => (
                <div key={libro.id_libro} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white truncate">{libro.titulo}</p>
                    </div>
                  </div>
                  <Badge scheme="brand">{libro.total_consultas}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
