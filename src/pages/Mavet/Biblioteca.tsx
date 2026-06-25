import { useMemo } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { useLibros, ITEMS_PER_PAGE } from "../../hooks/useLibros";
import { exportarCatalogoBiblioteca } from "../../services/pdf.service";
import LibroFormModal from "./biblioteca/LibroFormModal";
import PrestamoFormModal from "./biblioteca/PrestamoFormModal";
import LibroDetailModal from "./biblioteca/LibroDetailModal";

export default function Biblioteca() {
  const {
    autores, categorias, isLoading,
    searchTerm, setSearchTerm,
    filterEstado, setFilterEstado,
    filterCategoria, setFilterCategoria,
    filterAutor, setFilterAutor,
    searchCedula, setSearchCedula,
    currentPage, totalPages, totalItems,
    filteredLibros, filteredPrestamos,
    isPrestamoOpen, closePrestamo,
    isLibroOpen, closeLibro,
    selectedLibroTitle,
    cedula, setCedula, nombre, setNombre, isSubmitting,
    libroFormData, isEditing,
    selectedLibroForDetail, setSelectedLibroForDetail,
    confirm, setConfirm,
    goToPage, handleOpenPrestamo, handlePrestamoSubmit,
    handleOpenAddLibro, handleEditLibro, handleDeleteLibro,
    handleLibroChange, handleLibroSubmit,
  } = useLibros();

  const inputCls =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90";

  const toastMessage = (type: "success" | "error", msg: string) => {
    import("react-hot-toast").then(m => m.default[type](msg));
  };

  const handleReturnBook = async (libroId: string) => {
    try {
      const { mavetApi } = await import("../../services/api");
      const result = await mavetApi.devolverLibro(libroId);
      toastMessage("success", result.message);
      goToPage(currentPage);
    } catch (e: any) {
      toastMessage("error", e.message || "Error al devolver.");
    }
  };

  return (
    <div className="space-y-6 relative">

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
                className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90"
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
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90 min-w-[140px]"
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
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90 min-w-[160px]"
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
          <div className="flex-1 flex items-center justify-center">
            <LoadingSkeleton variant="table" rows={8} cols={6} />
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
                        <td className="px-3 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">
                          {libro.unidad || "—"}
                        </td>
                        <td className="px-3 py-3 font-semibold max-w-[250px]">
                          <span className="block truncate" title={libro.titulo}>{libro.titulo}</span>
                        </td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{libro.autor}</td>
                        <td className="px-3 py-3 text-gray-500 dark:text-gray-400">{libro.estante || "—"}</td>
                        <td className="px-3 py-3">
                          {libro.categoria ? (
                            <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-500/30">
                              {libro.categoria}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            libro.estado === "Aprobado"
                              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30"
                              : libro.estado === "Pendiente"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30"
                              : "bg-red-100 text-red-800 border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30"
                          }`}>{libro.estado}</span>
                        </td>
                        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {libro.cantidad_disponible > 0 && (
                              <button
                                onClick={() => handleOpenPrestamo(libro.id, libro.titulo)}
                                disabled={libro.estado === "Descartado/Venta"}
                                className={`font-semibold text-xs border px-2 py-1 rounded transition w-18 ${
                                  libro.estado === "Descartado/Venta"
                                    ? "text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
                                    : "text-brand-600 border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                                }`}
                              >Prestar</button>
                            )}
                            {libro.cantidad_disponible < libro.cantidad_total && (
                              <button
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
                                className="font-semibold text-xs border px-2 py-1 rounded transition w-18 text-green-600 border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                              >Devolver</button>
                            )}
                            {(libro.cantidad_disponible > 0 || libro.cantidad_disponible < libro.cantidad_total) && (
                              <div className="h-4 w-[1px] bg-gray-250 dark:bg-gray-700 mx-1"></div>
                            )}
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
            <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap justify-between items-center text-sm text-gray-600 dark:text-gray-400 mt-auto gap-2">
              <span>
                Mostrando <span className="font-semibold">{Math.min(filteredLibros.length, ITEMS_PER_PAGE)}</span> de{" "}
                <span className="font-semibold">{totalItems}</span> libros
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed"
                >Anterior</button>
                <span className="text-xs font-medium">Pág. {currentPage} de {totalPages || 1}</span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed"
                >Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════
          Sección: Control de Préstamos por Cédula
         ══════════════════════════════════════════ */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white text-base">Control de Préstamos por Cédula</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Busque por cédula para ver el historial de préstamos de una persona</p>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text" placeholder="Buscar por cédula..."
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
                  <td colSpan={6} className="px-5 py-6 text-center text-gray-500">
                    <p className="text-sm font-medium">
                      {searchCedula.trim() ? "No se encontraron préstamos para esta cédula." : "No hay préstamos activos."}
                    </p>
                  </td>
                </tr>
              ) : filteredPrestamos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-3 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">{p.cedulaSolicitante}</td>
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
                      <span className={`w-1.5 h-1.5 rounded-full ${p.estado === "ACTIVO" ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}></span>
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

      <LibroFormModal
        isOpen={isLibroOpen}
        onClose={closeLibro}
        isEditing={isEditing}
        libroFormData={libroFormData}
        autores={autores}
        categorias={categorias}
        isSubmitting={isSubmitting}
        onChange={handleLibroChange}
        onSubmit={handleLibroSubmit}
        inputCls={inputCls}
      />

      <PrestamoFormModal
        isOpen={isPrestamoOpen}
        onClose={closePrestamo}
        selectedLibroTitle={selectedLibroTitle}
        cedula={cedula}
        nombre={nombre}
        isSubmitting={isSubmitting}
        onCedulaChange={setCedula}
        onNombreChange={setNombre}
        onSubmit={handlePrestamoSubmit}
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
    </div>
  );
}
