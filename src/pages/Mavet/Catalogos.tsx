import { useState, useEffect, useCallback } from "react";
import { mavetApi } from "../../services/api";
import Button from "../../components/ui/button/Button";
import toast from "react-hot-toast";
import Tabs from "../../components/ui/Tabs";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import PermissionMatrix from "../../components/PermissionMatrix";
import { parsePermisos, permisosCompletos, Permisos } from "../../config/permissions";

const TABS = [
  { id: "roles", label: "Roles" },
  { id: "cargos", label: "Cargos" },
  { id: "categorias-obras", label: "Categorías Obras" },
  { id: "tecnicas", label: "Técnicas" },
  { id: "estados-obras", label: "Estados Obras" },
  { id: "categorias-libros", label: "Categorías Libros" },
  { id: "tipos-evento", label: "Tipos Evento" },
  { id: "motivos", label: "Motivos Visita" },
];

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea";
  required?: boolean;
}

interface TabConfig {
  title: string;
  desc: string;
  col1: string;
  col2?: string;
  load: () => Promise<any[]>;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<any>;
  fields: FieldDef[];
  getId: (item: any) => string;
  getCol1: (item: any) => string;
  getCol2?: (item: any) => string;
  renderFormExtra?: (props: {
    permisosValue: Permisos | "all";
    onPermisosChange: (v: Permisos | "all") => void;
  }) => React.ReactNode;
}

const CONFIGS: Record<string, TabConfig> = {
  roles: {
    title: "Roles", desc: "Roles y permisos del sistema.",
    col1: "Nombre del Rol", col2: "Permisos",
    load: () => mavetApi.getRoles(),
    create: (d) => mavetApi.crearRol({ nombre_rol: d.nombre_rol, permisos: d.permisos }),
    update: (id, d) => mavetApi.actualizarRol(id, d),
    remove: (id) => mavetApi.eliminarRol(id),
    getId: (i) => i.id_rol,
    getCol1: (i) => i.nombre_rol,
    getCol2: (i) => i.permisos,
    fields: [{ key: "nombre_rol", label: "Nombre del Rol", type: "text", required: true }],
    renderFormExtra: ({ permisosValue, onPermisosChange }) => (
      <PermissionMatrix value={permisosValue} onChange={onPermisosChange} />
    ),
  },
  cargos: {
    title: "Cargos", desc: "Cargos laborales de los trabajadores.",
    col1: "Nombre del Cargo", col2: "Descripción",
    load: () => mavetApi.getCargos(),
    create: (d) => mavetApi.crearCargo({ nombre_cargo: d.nombre_cargo, descripcion: d.descripcion }),
    update: (id, d) => mavetApi.actualizarCargo(id, d),
    remove: (id) => mavetApi.eliminarCargo(id),
    getId: (i) => i.id_cargo,
    getCol1: (i) => i.nombre_cargo,
    getCol2: (i) => i.descripcion,
    fields: [{ key: "nombre_cargo", label: "Nombre del Cargo", type: "text", required: true }, { key: "descripcion", label: "Descripción", type: "textarea" }],
  },
  "categorias-obras": {
    title: "Categorías de Obras", desc: "Categorías para clasificar las obras.",
    col1: "Nombre", col2: "Descripción",
    load: () => mavetApi.getCategoriasObra(),
    create: (d) => mavetApi.crearCategoria({ nombre_categoria: d.nombre_categoria, descripcion: d.descripcion }),
    update: (id, d) => mavetApi.actualizarCategoriaObra(id, d),
    remove: (id) => mavetApi.eliminarCategoriaObra(id),
    getId: (i) => i.id_categoria_obra,
    getCol1: (i) => i.nombre_categoria,
    getCol2: (i) => i.descripcion,
    fields: [{ key: "nombre_categoria", label: "Nombre", type: "text", required: true }, { key: "descripcion", label: "Descripción", type: "textarea" }],
  },
  tecnicas: {
    title: "Técnicas", desc: "Técnicas artísticas de las obras.",
    col1: "Nombre", col2: "Descripción",
    load: () => mavetApi.getTecnicas(),
    create: (d) => mavetApi.crearTecnica({ nombre_tecnica: d.nombre_tecnica, descripcion: d.descripcion }),
    update: (id, d) => mavetApi.actualizarTecnica(id, d),
    remove: (id) => mavetApi.eliminarTecnica(id),
    getId: (i) => i.id_tecnica,
    getCol1: (i) => i.nombre_tecnica,
    getCol2: (i) => i.descripcion,
    fields: [{ key: "nombre_tecnica", label: "Nombre", type: "text", required: true }, { key: "descripcion", label: "Descripción", type: "textarea" }],
  },
  "estados-obras": {
    title: "Estados de Obras", desc: "Estados de conservación de las obras.",
    col1: "Nombre", col2: "Descripción",
    load: () => mavetApi.getEstadosObra(),
    create: (d) => mavetApi.crearEstado({ nombre_estado: d.nombre_estado, descripcion: d.descripcion }),
    update: (id, d) => mavetApi.actualizarEstado(id, d),
    remove: (id) => mavetApi.eliminarEstado(id),
    getId: (i) => i.id_estado,
    getCol1: (i) => i.nombre_estado,
    getCol2: (i) => i.descripcion,
    fields: [{ key: "nombre_estado", label: "Nombre", type: "text", required: true }, { key: "descripcion", label: "Descripción", type: "textarea" }],
  },
  "categorias-libros": {
    title: "Categorías de Libros", desc: "Categorías para clasificar los libros.",
    col1: "Nombre", col2: "Ubicación Estante",
    load: () => mavetApi.getCategoriasLibro(),
    create: (d) => mavetApi.crearCategoriaLibro({ nombre_categoria: d.nombre_categoria, ubicacion_estante: d.ubicacion_estante }),
    update: (id, d) => mavetApi.actualizarCategoriaLibro(id, d),
    remove: (id) => mavetApi.eliminarCategoriaLibro(id),
    getId: (i) => i.id_categoria,
    getCol1: (i) => i.nombre_categoria,
    getCol2: (i) => i.ubicacion_estante,
    fields: [{ key: "nombre_categoria", label: "Nombre", type: "text", required: true }, { key: "ubicacion_estante", label: "Ubicación Estante", type: "text" }],
  },
  "tipos-evento": {
    title: "Tipos de Evento", desc: "Tipos de eventos para solicitudes del auditorio.",
    col1: "Nombre", col2: "Descripción",
    load: () => mavetApi.getTiposEvento(),
    create: (d) => mavetApi.crearTipoEvento({ nombre: d.nombre, descripcion: d.descripcion }),
    update: (id, d) => mavetApi.actualizarTipoEvento(id, d),
    remove: (id) => mavetApi.eliminarTipoEvento(id),
    getId: (i) => i.id_tipo_evento,
    getCol1: (i) => i.nombre,
    getCol2: (i) => i.descripcion,
    fields: [{ key: "nombre", label: "Nombre", type: "text", required: true }, { key: "descripcion", label: "Descripción", type: "textarea" }],
  },
  motivos: {
    title: "Motivos de Visita", desc: "Motivos para el registro de visitantes.",
    col1: "Nombre", col2: "Descripción",
    load: () => mavetApi.obtenerMotivos(),
    create: (d) => mavetApi.crearMotivo({ nombre: d.nombre, descripcion: d.descripcion }),
    update: (id, d) => mavetApi.actualizarMotivo(id, d),
    remove: (id) => mavetApi.eliminarMotivo(id),
    getId: (i) => i.id_motivo,
    getCol1: (i) => i.nombre,
    getCol2: (i) => i.descripcion,
    fields: [{ key: "nombre", label: "Nombre", type: "text", required: true }, { key: "descripcion", label: "Descripción", type: "textarea" }],
  },
};

function CatalogTable({ config }: { config: TabConfig }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [delId, setDelId] = useState<string | null>(null);

  const [permisosValue, setPermisosValue] = useState<Permisos | "all">({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await config.load();
      setItems(data);
    } catch { toast.error(`Error al cargar ${config.title.toLowerCase()}`); }
    finally { setLoading(false); }
  }, [config]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    const init: Record<string, string> = {};
    config.fields.forEach(f => init[f.key] = "");
    setFormData(init);
    setEditing(false);
    setEditId(null);
    setFormError("");
    setPermisosValue({});
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    const init: Record<string, string> = {};
    config.fields.forEach(f => init[f.key] = item[f.key] || "");
    setFormData(init);
    setEditing(true);
    setEditId(config.getId(item));
    setFormError("");
    setPermisosValue(parsePermisos(item.permisos));
    setShowForm(true);
  };

  const handleSave = async () => {
    const required = config.fields.filter(f => f.required);
    for (const f of required) {
      if (!formData[f.key]?.trim()) {
        setFormError(`${f.label} es obligatorio`);
        return;
      }
    }
    const data = { ...formData };
    if (config.renderFormExtra) {
      data.permisos = permisosValue === "all" ? "all" : JSON.stringify(permisosValue);
    }
    setSubmitting(true);
    setFormError("");
    try {
      if (editing && editId) {
        await config.update(editId, data);
        toast.success("Actualizado correctamente");
      } else {
        await config.create(data);
        toast.success("Creado correctamente");
      }
      setShowForm(false);
      load();
    } catch (e: any) {
      setFormError(e.message || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try {
      await config.remove(delId);
      toast.success("Eliminado correctamente");
      setDelId(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar");
      setDelId(null);
    }
  };

  const filtered = search
    ? items.filter(i => config.getCol1(i).toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <ComponentCard
      title={config.title}
      desc={config.desc}
      action={
        <Button size="sm" onClick={openCreate}
          startIcon={<PlusIcon />}>Nuevo</Button>
      }
    >
      <div className="overflow-hidden border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
        <div className="px-4 pb-4">
          <div className="relative w-full sm:w-72">
            <input type="text" placeholder="Buscar..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? "No se encontraron resultados." : "No hay registros."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">{config.col1}</th>
                  {config.col2 && <th className="px-6 py-4 font-semibold">{config.col2}</th>}
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((item) => (
                  <tr key={config.getId(item)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{config.getCol1(item)}</td>
                    {config.col2 && config.getCol2 && (
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={config.getCol2(item)}>
                        {config.getCol2(item) || <span className="text-gray-400 italic">-</span>}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="xs" onClick={() => openEdit(item)}
                          startIcon={<EditIcon />}>Editar</Button>
                        <Button variant="danger" size="xs" onClick={() => setDelId(config.getId(item))}
                          startIcon={<TrashIcon />}>Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} className="max-w-lg p-0 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editing ? `Editar ${config.title.slice(0, -1)}` : `Nuevo ${config.title.slice(0, -1)}`}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{editing ? "Modifique los datos." : "Agregue un nuevo registro."}</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <XIcon />
            </button>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-5">
          <div className="space-y-4">
            {config.fields.map((f) => (
              <div key={f.key}>
                <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                  {f.label} {f.required && <span className="text-red-400">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea rows={2} placeholder={f.label}
                    value={formData[f.key] || ""}
                    onChange={(e) => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90 resize-none" />
                ) : (
                  <input type="text" placeholder={f.label}
                    value={formData[f.key] || ""}
                    onChange={(e) => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:text-white/90" />
                )}
              </div>
            ))}
            {config.renderFormExtra && (
              <config.renderFormExtra
                permisosValue={permisosValue}
                onPermisosChange={setPermisosValue}
              />
            )}
          </div>

          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <span className="flex-1">{formError}</span>
              <button type="button" onClick={() => setFormError("")} className="text-red-500 hover:text-red-700">
                <XIcon />
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-50">
              {submitting ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!delId} onClose={() => setDelId(null)} className="max-w-sm p-0 overflow-hidden">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Eliminar registro</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">¿Está seguro? Esta acción no se puede deshacer.</p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setDelId(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Sí, eliminar</Button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
}

function PlusIcon() { return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>; }
function SearchIcon() { return <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>; }
function EditIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>; }
function TrashIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>; }
function XIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>; }
function Spinner() { return <svg className="animate-spin h-8 w-8 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>; }

export default function Catalogos() {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catálogos del Sistema</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestión unificada de catálogos y tablas de referencia del sistema.
        </p>
      </div>

      <Tabs tabs={TABS.map(t => ({ id: t.id, label: t.label }))} activeTab={activeTab} onChange={setActiveTab} variant="underline" />

      <div className="mt-6">
        {TABS.map(tab => activeTab === tab.id && (
          <CatalogTable key={tab.id} config={CONFIGS[tab.id]} />
        ))}
      </div>
    </div>
  );
}
