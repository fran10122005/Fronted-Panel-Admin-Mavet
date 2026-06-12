import { useState, useEffect, useMemo } from "react";
import { mavetApi } from "../../services/api";
import { exportarInventarioObras } from "../../services/pdf.service";
import { Obra } from "../../types";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";

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
  const [obras, setObras] = useState<Obra[]>([]);
  const [artistas, setArtistas] = useState<any[]>([]);
  const [tecnicas, setTecnicas] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<any>(initialFormState);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    const fetchDatos = async () => {
      setIsLoading(true);
      try {
        // Ejecutamos las peticiones independientemente para que un fallo en una no bloquee las demás
        const artData = await mavetApi.getArtistas().catch(e => { console.error("Error Artistas:", e); return []; });
        setArtistas(artData);

        const tecData = await mavetApi.getTecnicas().catch(e => { console.error("Error Tecnicas:", e); return []; });
        setTecnicas(tecData);

        const estData = await mavetApi.getEstadosObra().catch(e => { console.error("Error Estados:", e); return []; });
        setEstados(estData);

        const catData = await mavetApi.getCategoriasObra().catch(e => { console.error("Error Categorias:", e); return []; });
        setCategorias(catData);

        const obrasData = await mavetApi.getObras().catch(e => { console.error("Error Obras:", e); return []; });
        setObras(obrasData);
      } catch (error) {
        console.error("Error general al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDatos();
  }, []);

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setImagenFile(null);
    setIsEditing(false);
    openModal();
  };

  const handleEdit = (obra: Obra) => {
    setFormData(obra);
    setImagenFile(null);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta obra del inventario?")) {
      try {
        setIsLoading(true);
        await mavetApi.eliminarObra(id);
        const data = await mavetApi.getObras();
        setObras(data);
        showAlert("Obra eliminada exitosamente", "success");
      } catch (error: any) {
        showAlert(error.message || "Error al eliminar obra", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Parse immediate dropdown selection fields to numbers
    const dropdownFields = ['id_artista', 'id_tecnica', 'id_estado_actual', 'id_categoria_obra'];
    
    setFormData((prev: any) => ({ 
      ...prev, 
      [name]: dropdownFields.includes(name) 
        ? (value ? parseInt(value, 10) : undefined)
        : value 
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.id_artista || !formData.id_tecnica || !formData.id_estado_actual || !formData.id_categoria_obra || !formData.tipo_ingreso) {
      showAlert("Por favor complete todos los campos obligatorios.", "error");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      ...formData,
      ano: formData.ano !== undefined && formData.ano !== "" ? parseInt(formData.ano.toString(), 10) : null,
      piezas: formData.piezas !== undefined && formData.piezas !== "" ? parseInt(formData.piezas.toString(), 10) : 1,
      peso: formData.peso !== undefined && formData.peso !== "" && formData.peso !== null ? parseFloat(formData.peso.toString()) : null,
    };

    let dataToSend: any = payload;

    // Si hay una imagen nueva o estamos creando y se seleccionó una imagen
    if (imagenFile) {
      dataToSend = new FormData();
      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== undefined) {
          dataToSend.append(key, payload[key]);
        }
      });
      dataToSend.append("imagen", imagenFile);
    }

    try {
      if (isEditing) {
        await mavetApi.actualizarObra(formData.id, dataToSend);
        showAlert("Obra actualizada exitosamente", "success");
      } else {
        await mavetApi.crearObra(dataToSend);
        showAlert("Obra registrada exitosamente", "success");
      }
      const data = await mavetApi.getObras();
      setObras(data);
      closeModal();
    } catch (error: any) {
      showAlert(error.message || "Error al guardar obra", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Alerta flotante */}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario de Bóveda</h1>
          <p className="text-sm text-gray-500">Catálogo de obras de arte registradas.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (obras.length === 0) return;
              exportarInventarioObras(filteredObras);
            }}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar PDF
          </button>
          <button 
            onClick={handleOpenAdd}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Agregar Nueva Obra
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
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Restauración">En Restauración</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando inventario desde el servidor...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
                    <th className="px-5 py-4">Código</th>
                    <th className="px-5 py-4">Título</th>
                    <th className="px-5 py-4">Autor</th>
                    <th className="px-5 py-4">Medidas</th>
                    <th className="px-5 py-4">Peso (kg)</th>
                    <th className="px-5 py-4">Año</th>
                    <th className="px-5 py-4 text-center">Piezas</th>
                    <th className="px-5 py-4">Categoría/Modalidad</th>
                    <th className="px-5 py-4">Técnica</th>
                    <th className="px-5 py-4">Tipo Ingreso</th>
                    <th className="px-5 py-4 text-center">Estado</th>
                    <th className="px-5 py-4">Descripción</th>
                    <th className="px-5 py-4">Ubicación</th>
                    <th className="px-5 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredObras.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-5 py-12 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-base font-medium">No se encontraron resultados</p>
                        <p className="text-sm mt-1">Prueba ajustando tu búsqueda o filtros.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredObras.map((obra) => (
                      <tr key={obra.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-brand-600 dark:text-brand-400 font-medium">{obra.codigo_inventario || obra.id}</td>
                        <td className="px-5 py-4 font-semibold">{obra.titulo}</td>
                        <td className="px-5 py-4">{obra.autor}</td>
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{obra.medidas}</td>
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{obra.peso || '—'}</td>
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{obra.ano}</td>
                        <td className="px-5 py-4 text-center font-medium">{obra.piezas ?? 1}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400">
                            {obra.categoria || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">{obra.tecnica}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            obra.tipo_ingreso === 'Por donación'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'
                          }`}>{obra.tipo_ingreso || '—'}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            obra.estado === 'Excelente' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-400' :
                            obra.estado === 'Bueno' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400' :
                            'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400'
                          }`}>
                            {obra.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={obra.descripcion}>{obra.descripcion || '—'}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{obra.ubicacion}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(obra)}
                              className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(obra.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
              <span>Mostrando {filteredObras.length} de {obras.length} obras</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">Anterior</button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Formulario Administrativo */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {isEditing ? `Editar Obra: ${formData.id}` : "Registrar Nueva Obra"}
          </h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Código / Serial</label>
                <input
                  type="text"
                  name="codigo_inventario"
                  value={formData.codigo_inventario || ""}
                  onChange={handleChange}
                  placeholder="Ej. MVT-001"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Autor / Artista</label>
                <select
                  name="id_artista"
                  value={formData.id_artista || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                >
                  <option value="" disabled>Seleccione un artista...</option>
                  {artistas.map((a: any) => (
                    <option key={a.id_artista} value={a.id_artista}>{a.nombres} {a.apellidos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Medidas</label>
                <input
                  type="text"
                  name="medidas"
                  value={formData.medidas}
                  onChange={handleChange}
                  placeholder="Ej. 120x80 cm"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Año</label>
                <input
                  type="number"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Estado de Conservación</label>
                <select
                  name="id_estado_actual"
                  value={formData.id_estado_actual || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                >
                  <option value="" disabled>Seleccione un estado...</option>
                  {estados.map((e: any) => (
                    <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Categoría / Modalidad</label>
                <select
                  name="id_categoria_obra"
                  value={formData.id_categoria_obra || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                >
                  <option value="" disabled>Seleccione una categoría...</option>
                  {categorias.map((c: any) => (
                    <option key={c.id_categoria_obra} value={c.id_categoria_obra}>{c.nombre_categoria}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Técnica</label>
                <select
                  name="id_tecnica"
                  value={formData.id_tecnica || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                >
                  <option value="" disabled>Seleccione una técnica...</option>
                  {tecnicas.map((t: any) => (
                    <option key={t.id_tecnica} value={t.id_tecnica}>{t.nombre_tecnica}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  placeholder="Ej. Bóveda, Sala Principal"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Fila: Cantidad de piezas, Tipo de ingreso, Peso */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad de Piezas</label>
                <input
                  type="number"
                  name="piezas"
                  min={1}
                  value={formData.piezas ?? 1}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
                <input
                  type="number"
                  name="peso"
                  step="0.01"
                  min={0}
                  value={formData.peso || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Ingreso</label>
                <select
                  name="tipo_ingreso"
                  value={formData.tipo_ingreso || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  required
                >
                  <option value="" disabled>Seleccione tipo de ingreso...</option>
                  <option value="Por donación">Por donación</option>
                  <option value="Por requisito de exposición">Por requisito de exposición del autor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Descripción / Detalles adicionales</label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción detallada de la obra..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none resize-y"
              ></textarea>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Imagen de la Obra</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
              {isEditing && formData.imagen_url && !imagenFile && (
                <p className="mt-2 text-sm text-gray-500">Ya existe una imagen cargada. Suba un archivo solo si desea reemplazarla.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={closeModal}
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
                  isEditing ? "Actualizar Obra" : "Registrar Obra"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
