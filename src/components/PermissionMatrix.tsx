import { MODULOS, Permisos, permisosCompletos } from "../config/permissions";

interface PermissionMatrixProps {
  value: Permisos | "all";
  onChange: (value: Permisos | "all") => void;
}

const ACCIONES = ["read", "write", "delete"] as const;
const ACCION_LABELS: Record<string, string> = { read: "Ver", write: "Crear/Editar", delete: "Eliminar" };

export default function PermissionMatrix({ value, onChange }: PermissionMatrixProps) {
  const permisos = value === "all" ? permisosCompletos() : value;

  const toggleModule = (mod: string, checked: boolean) => {
    if (value === "all" && !checked) {
      const base = permisosCompletos();
      base[mod] = [];
      onChange(base);
      return;
    }
    if (checked) {
      const next = { ...permisos, [mod]: [...MODULOS[mod as keyof typeof MODULOS].acciones] };
      onChange(next);
    } else {
      const next = { ...permisos, [mod]: [] };
      onChange(next);
    }
  };

  const toggleAction = (mod: string, accion: string, checked: boolean) => {
    const current: string[] = permisos[mod] || [];
    const next = checked
      ? [...current, accion]
      : current.filter((a) => a !== accion);
    onChange({ ...permisos, [mod]: next });
  };

  const allSelected = Object.keys(MODULOS).every((m) => {
    const p = permisos[m] || [];
    return MODULOS[m as keyof typeof MODULOS].acciones.every((a) => p.includes(a));
  });

  return (
    <div>
      <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
        Permisos <span className="text-red-400">*</span>
      </label>
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <input
            type="checkbox"
            id="perm-all"
            checked={allSelected}
            onChange={(e) => onChange(e.target.checked ? "all" : {})}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="perm-all" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            {allSelected ? "Quitar todos" : "Seleccionar todos"}
          </label>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {Object.entries(MODULOS).map(([key, mod]) => {
            const permModule: string[] = permisos[key] || [];
            const allActions = mod.acciones as readonly string[];
            const moduleChecked = allActions.length > 0 && allActions.every((a) => permModule.includes(a));
            return (
              <div key={key} className="px-4 py-2.5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-2 min-w-0 w-48 shrink-0">
                  <input
                    type="checkbox"
                    id={`mod-${key}`}
                    checked={moduleChecked}
                    onChange={(e) => toggleModule(key, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor={`mod-${key}`} className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer select-none truncate">
                    {mod.label}
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  {allActions.map((accion) => (
                    <label key={accion} className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={permModule.includes(accion)}
                        onChange={(e) => toggleAction(key, accion, e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{ACCION_LABELS[accion] || accion}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
