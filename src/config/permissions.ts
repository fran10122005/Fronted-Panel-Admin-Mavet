export const MODULOS = {
  dashboard: { label: 'Dashboard', acciones: ['read'] as const },
  recepcion: { label: 'Recepción', acciones: ['read', 'write'] as const },
  auditorio: { label: 'Auditorio', acciones: ['read', 'write', 'delete'] as const },
  talleres: { label: 'Talleres', acciones: ['read', 'write', 'delete'] as const },
  asistencia: { label: 'Asistencia', acciones: ['read', 'write'] as const },
  biblioteca: { label: 'Biblioteca', acciones: ['read', 'write', 'delete'] as const },
  inventario_obras: { label: 'Inventario de Bóveda', acciones: ['read', 'write', 'delete'] as const },
  rrhh: { label: 'Recursos Humanos', acciones: ['read', 'write', 'delete'] as const },
  educacion: { label: 'Educación', acciones: ['read', 'write', 'delete'] as const },
  auditoria: { label: 'Auditoría', acciones: ['read'] as const },
  catalogos: { label: 'Catálogos', acciones: ['read', 'write', 'delete'] as const },
  configuracion: { label: 'Configuración', acciones: ['read', 'write'] as const },
  papelera: { label: 'Papelera', acciones: ['read', 'write', 'delete'] as const },
  usuarios: { label: 'Usuarios', acciones: ['read', 'write', 'delete'] as const },
} as const;

export type Modulo = keyof typeof MODULOS;
export type Accion = 'read' | 'write' | 'delete';

export type Permisos = Record<string, Accion[]>;

export function permisosCompletos(): Permisos {
  const result: Permisos = {};
  for (const [key, mod] of Object.entries(MODULOS)) {
    result[key] = [...mod.acciones];
  }
  return result;
}

export function parsePermisos(raw: string | Permisos | null | undefined): Permisos | 'all' {
  if (!raw) return {};
  if (raw === 'all') return 'all';
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function tienePermiso(permisos: Permisos | 'all' | null | undefined, modulo: Modulo, accion: Accion): boolean {
  if (!permisos) return false;
  if (permisos === 'all') return true;
  return permisos[modulo]?.includes(accion) ?? false;
}

export function tieneAlgunPermiso(permisos: Permisos | 'all' | null | undefined, modulo: Modulo): boolean {
  if (!permisos) return false;
  if (permisos === 'all') return true;
  const mod = permisos[modulo];
  return !!mod && mod.length > 0;
}
