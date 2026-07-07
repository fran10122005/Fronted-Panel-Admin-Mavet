import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { mavetApi } from "../../services/api";
import toast from "react-hot-toast";
import Skeleton from "../../components/ui/Skeleton";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";

export default function Papelera() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<"restore" | "delete" | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchPapelera = async () => {
    setIsLoading(true);
    try {
      const data = await mavetApi.getPapeleraGlobal();
      setItems(data);
    } catch (error) {
      toast.error("Error al cargar la papelera");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapelera();
  }, []);

  const handleRestore = async () => {
    if (!selectedItem) return;
    try {
      await mavetApi.restaurarDePapelera(selectedItem.tipo, selectedItem.id);
      toast.success("Registro restaurado correctamente.");
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id || i.tipo !== selectedItem.tipo));
    } catch (error: any) {
      toast.error(error.message || "Error al restaurar el registro");
    } finally {
      setModalType(null);
      setSelectedItem(null);
    }
  };

  const handleForceDelete = async () => {
    if (!selectedItem) return;
    try {
      await mavetApi.eliminarDefinitivo(selectedItem.tipo, selectedItem.id);
      toast.success("Registro eliminado permanentemente.");
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id || i.tipo !== selectedItem.tipo));
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el registro");
    } finally {
      setModalType(null);
      setSelectedItem(null);
    }
  };

  return (
    <>
      <PageMeta
        title="Papelera de Reciclaje | MAVET"
        description="Gestión de registros eliminados"
      />
      <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Papelera de Reciclaje</h1>
            <p className="text-sm text-gray-500">Aquí puedes restaurar elementos eliminados o borrarlos de forma permanente.</p>
          </div>
          <Link
            to="/"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver al Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Título / Nombre</th>
                  <th className="px-6 py-4">Detalle / ID</th>
                  <th className="px-6 py-4">Fecha de Eliminación</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        <p className="text-base font-medium">La papelera está vacía</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${
                          item.tipo === 'Obra' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' :
                          item.tipo === 'Libro' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20' :
                          item.tipo === 'Trabajador' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' :
                          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
                        }`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.titulo}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.detalle || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(item.fecha_eliminacion).toLocaleString('es-VE')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setModalType("restore");
                            }}
                            className="p-1.5 text-brand-600 hover:text-brand-800 hover:bg-brand-50 dark:hover:bg-brand-500/20 rounded transition-colors"
                            title="Restaurar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setModalType("delete");
                            }}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-500/20 rounded transition-colors"
                            title="Eliminar permanentemente"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL RESTAURAR */}
      <Modal
        isOpen={modalType === "restore"}
        onClose={() => setModalType(null)}
        title="Restaurar Registro"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            ¿Estás seguro que deseas restaurar este registro? Volverá a aparecer en las listas correspondientes.
            <br /><br />
            <strong>{selectedItem?.titulo}</strong> ({selectedItem?.tipo})
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalType(null)}>Cancelar</Button>
            <Button onClick={handleRestore}>Sí, restaurar</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL ELIMINAR */}
      <Modal
        isOpen={modalType === "delete"}
        onClose={() => setModalType(null)}
        title="Eliminar Definitivamente"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-red-600 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-sm font-medium">Esta acción no se puede deshacer.</p>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            ¿Estás seguro que deseas eliminar permanentemente: <br/><strong>{selectedItem?.titulo}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalType(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleForceDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
