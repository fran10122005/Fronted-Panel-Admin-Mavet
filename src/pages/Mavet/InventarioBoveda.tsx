import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { Obra } from "../../types";
import { AlertCircle } from "lucide-react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/Badge";
import { limitNumericInput } from "../../utils/validation";
import Pagination from "../../components/ui/Pagination";
import HistorialObraModal from "../../components/ui/HistorialObraModal";
import ObraDetailModal from "./inventario/ObraDetailModal";
import { exportarInventarioObras } from "../../services/pdf.service";
import useInventario from "../../hooks/useInventario";
import PageHeader from "../../components/common/PageHeader";

export default function InventarioBoveda() {
  const {
    canEditObra, canDeleteObra,
    previewUrlRef, artistDropdownRef,
    obras, artistas, tecnicas, filteredTecnicas, estados, categorias, espacios,
    isLoading,
    searchTerm, setSearchTerm,
    filterEstado, setFilterEstado,
    filterCategoria, setFilterCategoria,
    filterAutor, setFilterAutor,
    filterUbicacion, setFilterUbicacion,
    filterClasificacion, setFilterClasificacion,
    sortConfig, handleSort,
    isOpen, closeModal,
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
    ITEMS_PER_PAGE, currentPage, totalPages, totalItems,
    goToPage,
    handleOpenAdd, handleEdit, handleDelete,
    handleChange, handleSave,
    artistsList,
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
    birthMinDate, birthMaxDate,
    handleArtistSearch, selectArtistSearchResult,
    handleArtistFormOpen, handleArtistDelete, handleArtistSave,
    validateCedula,
    filteredArtistsList,
    filteredObras,
    
  } = useInventario();

  const [searchParams, setSearchParams] = useSearchParams();

  // Manejar apertura automática desde código QR o enlace directo
  useEffect(() => {
    if (!isLoading && obras.length > 0) {
      const id = searchParams.get("id");
      if (id) {
        const obra = obras.find((o: any) => String(o.id) === id || String(o.codigo_inventario) === id);
        if (obra) {
          setSelectedObraForDetail(obra);
          // Opcional: limpiar la URL después de abrir
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("id");
          setSearchParams(newParams, { replace: true });
        }
      }
    }
  }, [isLoading, obras, searchParams, setSearchParams, setSelectedObraForDetail]);

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Inventario de Bóveda"
        subtitle="Catálogo de obras de arte registradas."
        actions={
          <>
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
          </>
        }
      />

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
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
            
            <div className="flex items-center w-full sm:w-auto">
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
                <option value="">Orden predeterminado</option>
                <option value="codigo_inventario_asc">ID (Menor a Mayor)</option>
                <option value="codigo_inventario_desc">ID (Mayor a Menor)</option>
                <option value="titulo_asc">Título (A-Z)</option>
                <option value="titulo_desc">Título (Z-A)</option>
                <option value="autor_asc">Autor (A-Z)</option>
                <option value="autor_desc">Autor (Z-A)</option>
                <option value="anio_desc">Año (Más recientes)</option>
                <option value="anio_asc">Año (Más antiguos)</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full">
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="flex-1 min-w-[140px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200 dark:text-white/90"
            >
              <option value="Todos">Categoría: Todas</option>
              {categorias.map((c: any) => (
                <option key={c.id_categoria_obra} value={c.nombre_categoria}>{c.nombre_categoria}</option>
              ))}
            </select>
            
            <select
              value={filterAutor}
              onChange={(e) => setFilterAutor(e.target.value)}
              className="flex-1 min-w-[140px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200 dark:text-white/90"
            >
              <option value="Todos">Autor: Todos</option>
              {artistas.map((a: any) => (
                <option key={a.id_artista} value={`${a.nombres || ""} ${a.apellidos || ""}`.trim()}>
                  {a.nombres} {a.apellidos}
                </option>
              ))}
            </select>
            
            <select
              value={filterUbicacion}
              onChange={(e) => setFilterUbicacion(e.target.value)}
              className="flex-1 min-w-[140px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200 dark:text-white/90"
            >
              <option value="Todos">Ubicación: Todas</option>
              {espacios.map((e: any) => (
                <option key={e.id_espacio} value={e.nombre_espacio}>{e.nombre_espacio}</option>
              ))}
            </select>
            
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="flex-1 min-w-[140px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200 dark:text-white/90"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Restauración">En Restauración</option>
            </select>
            
            <select
              value={filterClasificacion}
              onChange={(e) => setFilterClasificacion(e.target.value)}
              className="flex-1 min-w-[140px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200 dark:text-white/90"
            >
              <option value="Todos">Clasificación: Todas</option>
              <option value="BIC">BIC</option>
              <option value="monumento">Monumento</option>
              <option value="bien_cultural">Bien Cultural</option>
              <option value="no_clasificado">No clasificado</option>
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
              <table data-tour="table-obras" className="w-full text-left table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-2.5" onClick={() => handleSort("codigo_inventario")} style={{cursor: 'pointer'}}>
                      Código {sortConfig?.key === "codigo_inventario" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="px-2 py-2.5" onClick={() => handleSort("titulo")} style={{cursor: 'pointer'}}>
                      Título {sortConfig?.key === "titulo" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="px-2 py-2.5" onClick={() => handleSort("autor")} style={{cursor: 'pointer'}}>
                      Autor {sortConfig?.key === "autor" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </th>
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
            <h2 data-tour="heading-artistas" className="text-lg font-bold text-gray-900 dark:text-white">Artistas</h2>
            <span className="text-xs text-gray-500">({artistsList.length} registrados)</span>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              data-tour="input-buscar-artista"
              placeholder="Buscar artista..."
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
              className="pl-9 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table data-tour="table-artistas" className="w-full text-left table-auto">
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
                              const [nombres, ...apellidosArr] = artistInput.trim().split(" ");
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
                    {filteredTecnicas.map((t: any) => (
                      <option key={t.id_tecnica} value={t.id_tecnica}>{t.nombre_tecnica}</option>
                    ))}
                    <option value="other">Otra (especificar)...</option>
                  </select>
                )}
                {formErrors.id_tecnica && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.id_tecnica}</p>}
                {formErrors.customTecnica && <p className="text-red-500 text-[11px] mt-0.5">{formErrors.customTecnica}</p>}
              </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <div className="sm:col-span-2">
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
                        className={`w-full rounded-lg border pl-3 pr-10 py-2.5 text-base focus:outline-none dark:text-white/90 ${
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
                        className={`w-full rounded-lg border pl-3 pr-10 py-2.5 text-base focus:outline-none dark:text-white/90 ${
                          formErrors.largo
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                        }`}
                        required
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 dark:text-gray-500 pointer-events-none">cm</span>
                    </div>
                    {categorias.find((c: any) => c.id_categoria_obra == formData.id_categoria_obra)?.nombre_categoria === "Escultura" && (
                      <>
                        <span className="text-sm font-bold text-gray-400 dark:text-gray-500 px-0.5 select-none">x</span>
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            name="alto"
                            placeholder="Alto"
                            min={1}
                            max={1000}
                            value={formData.alto ?? ""}
                            onChange={handleChange}
                            className={`w-full rounded-lg border pl-3 pr-10 py-2.5 text-base focus:outline-none dark:text-white/90 ${
                              formErrors.alto
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200'
                                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900'
                            }`}
                            required
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 dark:text-gray-500 pointer-events-none">cm</span>
                        </div>
                      </>
                    )}
                  </div>
                  {(formErrors.ancho || formErrors.largo || formErrors.alto) && (
                    <p className="text-red-500 text-[11px] mt-0.5">{formErrors.ancho || formErrors.largo || formErrors.alto}</p>
                  )}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
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
