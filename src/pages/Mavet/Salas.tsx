import { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/Badge";
import toast from "react-hot-toast";
import { generateNextCode } from "../../utils/codeGenerator";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import SalasFormModal from "./salas/SalasFormModal";

interface Espacio {
  id_espacio?: number;
  id?: number;
  codigo_espacio?: string;
  nombre_espacio: string;
  capacidad_maxima?: number;
  descripcion?: string;
  imagen_url?: string;
}

export default function Salas() {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedEspacio, setSelectedEspacio] = useState<Espacio | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({
    open: false, id: null
  });

  const loadEspacios = async () => {
    setIsLoading(true);
    try {
      const data = await mavetApi.getEspaciosMuseo();
      setEspacios(data);
    } catch {
      toast.error("Error al cargar los espacios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEspacios(); }, []);

  const openCrear = async () => {
    setIsEditing(false);
    setSelectedId(null);
    setSelectedEspacio(null);
    setFormError("");
    const nextCode = generateNextCode(
      espacios.map(e => e.id_espacio || e.id || 0),
      "EMU", 5
    );
    setSelectedEspacio({ nombre_espacio: "", codigo_espacio: nextCode, capacidad_maxima: undefined, descripcion: "" } as any);
    setIsModalOpen(true);
  };

  const openEditar = (espacio: Espacio) => {
    setIsEditing(true);
    setSelectedId(espacio.id_espacio || espacio.id || null);
    setSelectedEspacio(espacio);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setFormError("");
    try {
      let payload: any = {
        codigo_espacio: data.codigo_espacio || undefined,
        nombre_espacio: data.nombre_espacio,
        descripcion: data.descripcion || undefined,
      };
      if (data.capacidad_maxima) payload.capacidad_maxima = Number(data.capacidad_maxima);

      if (data.imagenFile) {
        const fd = new FormData();
        Object.keys(payload).forEach(key => fd.append(key, payload[key]));
        fd.append("imagen", data.imagenFile);
        payload = fd;
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
      setFormError(error.message || "Error al guardar el espacio");
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
          <Button size="sm" onClick={openCrear} data-tour="nuevo-espacio"
            startIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}>
            Nuevo Espacio
          </Button>
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
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Capacidad</th>
                  <th className="px-6 py-4 font-semibold">Descripción</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {espacios.map((esp) => (
                  <tr key={esp.id_espacio || esp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {esp.imagen_url && (
                          <img src={esp.imagen_url} alt="" className="w-9 h-9 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{esp.nombre_espacio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {esp.capacidad_maxima ? (
                        <Badge scheme={esp.capacidad_maxima <= 10 ? "danger" : esp.capacidad_maxima <= 30 ? "warning" : "success"}>
                          {esp.capacidad_maxima} personas
                        </Badge>
                      ) : (
                        <span className="text-gray-400">No definida</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate text-sm" title={esp.descripcion}>
                      {esp.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="xs" onClick={() => openEditar(esp)} title="Editar"
                          startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}>
                          Editar
                        </Button>
                        <Button variant="danger" size="xs" onClick={() => setConfirmDelete({ open: true, id: esp.id_espacio || esp.id || null })} title="Eliminar"
                          startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </ComponentCard>

      <SalasFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFormError(""); }}
        isEditing={isEditing}
        initialData={selectedEspacio ? {
          codigo_espacio: selectedEspacio.codigo_espacio,
          nombre_espacio: selectedEspacio.nombre_espacio,
          capacidad_maxima: selectedEspacio.capacidad_maxima?.toString() as any,
          descripcion: selectedEspacio.descripcion,
          imagen_url: selectedEspacio.imagen_url,
        } : undefined}
        existingNames={espacios.map(e => e.nombre_espacio)}
        editingId={selectedId}
        isSubmitting={isSubmitting}
        formError={formError}
        onSubmit={handleSubmit}
        onDismissError={() => setFormError("")}
      />

      <Modal isOpen={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} className="max-w-sm p-0 overflow-hidden">
        <div className="p-6 text-center">
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
            <Button variant="secondary" onClick={() => setConfirmDelete({ open: false, id: null })}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
