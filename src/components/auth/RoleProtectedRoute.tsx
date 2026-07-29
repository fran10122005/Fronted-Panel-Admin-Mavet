import { Navigate, Outlet } from "react-router";
import { useAuth, getUserRole } from "../../context/AuthContext";
import { parsePermisos, tienePermiso, Permisos } from "../../config/permissions";

interface Props {
  allowedRoles?: string[];
  modulo?: string;
}

export default function RoleProtectedRoute({ allowedRoles, modulo }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  const userRole = getUserRole(user);
  const isSuperUser = userRole === "Administrador" || userRole === "admin";

  if (isSuperUser) return <Outlet />;

  if (modulo) {
    const rawPermisos = user?.Role?.permisos;
    const permisos = parsePermisos(rawPermisos);
    if (tienePermiso(permisos, modulo as any, "read")) return <Outlet />;
  }

  if (allowedRoles && allowedRoles.includes(userRole)) return <Outlet />;

  return <Navigate to="/" replace />;
}
