import React, { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import { Modal } from "../../components/ui/modal";
import toast from "react-hot-toast";
import { limitNumericInput } from "../../utils/validation";
import { generateNextCode } from "../../utils/codeGenerator";
import { Pencil, Trash2 } from "lucide-react";

import ComponentCard from "../../components/common/ComponentCard";

export default function Salas() {
  const [espacios, setEspacios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    codigo_espacio: "",
    nombre_espacio: "",
    capacidad_maxima: "",
    descripcion: ""
  });

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null
  });

  const loadEspacios = async () => {
    setIsLoading(true);
    try {
      const data = await mavetApi.getEspaciosMuseo();
      setEspacios(data);
    } catch (error) {
      toast.error("Error al cargar los espacios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEspacios();
  }, []);

  const openCrear = async () => {
    setIsEditing(false);
    setSelectedId(null);
    
    // Generar código automático
    const all = espacios;
    const nextCode = generateNextCode(
      all.map(e => e.id_espacio || e.id),
      "EMU",
      5
    );
    
    setFormData({ codigo_espacio: nextCode, nombre_espacio: "", capacidad_maxima: "", descripcion: "" });
    setIsModalOpen(true);
  };

  const openEditar = (espacio: any) => {
    setIsEditing(true);
    setSelectedId(espacio.id_espacio || espacio.id);
    setFormData({
      codigo_espacio: espacio.id_espacio || espacio.codigo_espacio || "",
      nombre_espacio: espacio.nombre_espacio || "",
      capacidad_maxima: espacio.capacidad_maxima || "",
      descripcion: espacio.descripcion || ""
    });
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_espacio.trim()) {
      toast.error("El nombre del espacio es obligatorio");
      return;
    }

    const trimmedName = formData.nombre_espacio.trim();
    const isDuplicate = espacios.some(e => 
      e.nombre_espacio.toLowerCase() === trimmedName.toLowerCase() && 
      (isEditing ? (e.id_espacio || e.id) !== selectedId : true)
    );

    if (isDuplicate) {
      toast.error("Ya existe un espacio con ese nombre");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        nombre_espacio: formData.nombre_espacio,
        descripcion: formData.descripcion
      };
      if (formData.capacidad_maxima) {
        payload.capacidad_maxima = Number(formData.capacidad_maxima);
      }

      if (isEditing && selectedId) {
        await mavetApi.actualizarEspacio(selectedId, payload);
        toast.success("Espacio actualizado correctamente");
      } else {
        await mavetApi.crearEspacio(payload);
        toast.success("Espacio creado correctamente");
      }
      setIsModalOpen(false);
      loadEspacios();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el espacio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await mavetApi.eliminarEspacio(confirmDelete.id);
      toast.success("Espacio eliminado");
      setConfirmDelete({ open: false, id: null });
      loadEspacios();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el espacio");
      setConfirmDelete({ open: false, id: null });
    }
  };

  return (
    <>
      <ComponentCard
        title="Gestión de Salas y Espacios"
        desc="Administración de los espacios disponibles en el museo."
        action={
          <button
            data-tour="nuevo-espacio"
            onClick={openCrear}
            className="bg-brand-600 text-white hover:bg-brand-700 font-semibold py-2 px-4 rounded-lg text-sm transition shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Nuevo Espacio
          </button>
        }
      >
        <div className="overflow-hidden border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
        {isLoading ? (
          <div className="p-8 flex justify-center text-gray-500">
            <svg className="animate-spin h-8 w-8 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : espacios.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No hay espacios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 uppercase border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Código</th>
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Capacidad</th>
                  <th className="px-6 py-4 font-semibold">Descripción</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {espacios.map((esp) => (
                  <tr key={esp.id_espacio || esp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">{esp.id_espacio || esp.id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-brand-600 dark:text-brand-400 font-medium">{esp.codigo_espacio || "—"}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{esp.nombre_espacio}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {esp.capacidad_maxima ? `${esp.capacidad_maxima} personas` : "No definida"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={esp.descripcion}>
                      {esp.descripcion || "Sin descripción"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                      <button
                        onClick={() => openEditar(esp)}
                        title="Editar"
                        className="text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ open: true, id: esp.id_espacio || esp.id })}
                        title="Eliminar"
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium ml-3 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </ComponentCard>

      {/* Modal Crear/Editar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {isEditing ? "Editar Espacio" : "Nuevo Espacio"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de Espacio</label>
              <input
                type="text"
                value={formData.codigo_espacio}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 focus:outline-none font-mono cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Espacio *</label>
              <input
                type="text"
                name="nombre_espacio"
                value={formData.nombre_espacio}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="Ej. Sala 1, Auditorio..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidad Máxima</label>
              <input
                type="number"
                name="capacidad_maxima"
                value={formData.capacidad_maxima}
                onChange={handleChange}
                onKeyDown={limitNumericInput}
                min="1"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="Ej. 50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="Detalles sobre el espacio..."
              ></textarea>
            </div>
            <div className="flex justify-end pt-4 gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal isOpen={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })}>
        <div className="p-4 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Eliminar Espacio</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            ¿Está seguro de que desea eliminar este espacio? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setConfirmDelete({ open: false, id: null })}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
