import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface Props {
  allowedRoles: string[];
}

export default function RoleProtectedRoute({ allowedRoles }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  const userRole = user?.Role?.nombre_rol || user?.rol || "Administrador";

  // Administrador and Gerente bypass all page routing checks
  const isSuperUser = userRole === "Administrador" || userRole === "admin" || userRole === "Gerente";
  const hasAccess = isSuperUser || allowedRoles.includes(userRole);

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
