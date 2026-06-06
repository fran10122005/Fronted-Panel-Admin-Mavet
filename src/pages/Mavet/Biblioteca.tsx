import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { Libro, PrestamoPayload } from "../../types";

const initialLibroState: Libro = {
  id: "",
  titulo: "",
  autor: "",
  estante: "",
  cantidad: 1,
  cuota: 0,
  estado: "Aprobado",
};

export default function Biblioteca() {
  const { isOpen: isPrestamoOpen, openModal: openPrestamo, closeModal: closePrestamo } = useModal();
  const { isOpen: isLibroOpen, openModal: openLibro, closeModal: closeLibro } = useModal();
  
  const [libros, setLibros] = useState<Libro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  
  // Modal Prestamo state
  const [selectedLibroTitle, setSelectedLibroTitle] = useState<string>("");
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal Libro state
  const [libroFormData, setLibroFormData] = useState<Libro>(initialLibroState);
  const [isEditing, setIsEditing] = useState(false);

  // Alert state
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const data = await mavetApi.getLibros();
        setLibros(data);
      } catch (error) {
        console.error("Error al cargar libros:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibros();
  }, []);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  // --- Lógica de Préstamo ---
  const handleOpenPrestamo = (titulo: string) => {
    setSelectedLibroTitle(titulo);
    openPrestamo();
  };

  const handlePrestamoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload: PrestamoPayload = {
      libroId: selectedLibroTitle,
      cedulaSolicitante: cedula,
      nombreSolicitante: nombre,
      horaPrestamo: new Date().toISOString(),
      estado: "ACTIVO"
    };

    try {
      const response = await mavetApi.registrarPrestamo(payload);
      closePrestamo();
      showAlert(response.message, 'success');
      setCedula("");
      setNombre("");
    } catch (error) {
      showAlert("Ocurrió un error al registrar el préstamo.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Lógica de Gestión de Libros ---
  const handleOpenAddLibro = () => {
    setLibroFormData(initialLibroState);
    setIsEditing(false);
    openLibro();
  };

  const handleEditLibro = (libro: Libro) => {
    setLibroFormData(libro);
    setIsEditing(true);
    openLibro();
  };

  const handleDeleteLibro = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este libro del inventario?")) {
      try {
        setIsLoading(true);
        await mavetApi.eliminarLibro(id);
        const data = await mavetApi.getLibros();
        setLibros(data);
        showAlert("Libro eliminado exitosamente.", 'success');
      } catch (error: any) {
        showAlert(error.message || "Error al eliminar libro.", 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLibroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLibroFormData(prev => ({ 
      ...prev, 
      [name]: (name === "cantidad" || name === "cuota") ? parseInt(value) || 0 : value 
    }));
  };

  const handleLibroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await mavetApi.actualizarLibro(libroFormData.id, libroFormData);
        showAlert("Libro actualizado correctamente.", 'success');
      } else {
        await mavetApi.crearLibro(libroFormData);
        showAlert("Nuevo libro registrado.", 'success');
      }
      const data = await mavetApi.getLibros();
      setLibros(data);
      closeLibro();
    } catch (error: any) {
      showAlert(error.message || "Error al guardar libro.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado reactivo de libros
  const filteredLibros = useMemo(() => {
    return libros.filter((libro) => {
      const matchesSearch = 
        libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
        libro.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        libro.autor.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesEstado = filterEstado === "Todos" || libro.estado === filterEstado;
      
      return matchesSearch && matchesEstado;
    });
  }, [libros, searchTerm, filterEstado]);

  return (
    <div className="space-y-6 relative">
      {/* Floating Alert */}
      {alertInfo.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${alertInfo.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="font-semibold text-sm">
              {alertInfo.type === 'success' ? '✅' : '⚠️'} {alertInfo.message}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario de Biblioteca</h1>
          <p className="text-sm text-gray-500">Gestión de libros, catálogos y préstamos en sala.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.open("http://localhost:3000/api/reportes/biblioteca", "_blank")}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Exportar PDF
          </button>
          <button 
            onClick={handleOpenAddLibro}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Registrar Nuevo Libro
          </button>
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
              className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
            <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando catálogo...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3">Unidad</th>
                    <th className="px-4 py-3">Título</th>
                    <th className="px-4 py-3">Autor</th>
                    <th className="px-4 py-3">Estante</th>
                    <th className="px-4 py-3 text-center">Cantidad</th>
                    <th className="px-4 py-3 text-center">Cuota</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Préstamo</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLibros.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-base font-medium">No se encontraron resultados</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLibros.map(libro => (
                      <tr key={libro.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-medium">{libro.id}</td>
                        <td className="px-4 py-3 font-semibold">{libro.titulo}</td>
                        <td className="px-4 py-3">{libro.autor}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{libro.estante}</td>
                        <td className="px-4 py-3 text-center">{libro.cantidad}</td>
                        <td className="px-4 py-3 text-center font-mono">{libro.cuota}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${
                            libro.estado === 'Aprobado' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-500/10 dark:text-green-400' :
                            libro.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 border-red-300 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            {libro.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => handleOpenPrestamo(libro.titulo)} 
                            disabled={libro.estado === 'Descartado/Venta'}
                            className={`font-semibold text-xs border px-3 py-1.5 rounded-lg transition ${
                              libro.estado === 'Descartado/Venta' 
                                ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' 
                                : 'text-brand-600 border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                            }`}
                          >
                            {libro.estado === 'Descartado/Venta' ? 'No Disp.' : 'Préstamo'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => handleEditLibro(libro)}
                              className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteLibro(libro.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400 gap-4 mt-auto">
              <span>Mostrando {filteredLibros.length} de {libros.length} unidades</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">Anterior</button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal 1: Formulario Administrativo de Libro */}
      <Modal isOpen={isLibroOpen} onClose={closeLibro} className="max-w-[700px] p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {isEditing ? `Editar Libro: ${libroFormData.id}` : "Registrar Nuevo Libro"}
          </h3>
          
          <form onSubmit={handleLibroSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={libroFormData.titulo}
                  onChange={handleLibroChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Autor</label>
                <input
                  type="text"
                  name="autor"
                  value={libroFormData.autor}
                  onChange={handleLibroChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Estante / Ubicación</label>
                <input
                  type="text"
                  name="estante"
                  value={libroFormData.estante}
                  onChange={handleLibroChange}
                  placeholder="Ej. Estante A - Fila 2"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  name="estado"
                  value={libroFormData.estado}
                  onChange={handleLibroChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                >
                  <option value="Aprobado">Aprobado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Descartado/Venta">Descartado/Venta</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad Total</label>
                <input
                  type="number"
                  name="cantidad"
                  min="1"
                  value={libroFormData.cantidad}
                  onChange={handleLibroChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cuota (Disponibles)</label>
                <input
                  type="number"
                  name="cuota"
                  min="0"
                  max={libroFormData.cantidad}
                  value={libroFormData.cuota}
                  onChange={handleLibroChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={closeLibro}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center min-w-[150px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isEditing ? "Actualizar Libro" : "Registrar Libro"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal 2: Registrar Préstamo */}
      <Modal isOpen={isPrestamoOpen} onClose={closePrestamo} className="max-w-md p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Registrar Préstamo</h3>
          <p className="text-sm text-gray-500 mb-6">Libro: <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedLibroTitle}</span></p>
          
          <form onSubmit={handlePrestamoSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cédula del Solicitante</label>
              <input 
                type="text" 
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50" 
                placeholder="V-12345678" 
                required 
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Solicitante</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50" 
                placeholder="Ej. María López" 
                required 
              />
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-6 pt-6">
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
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
