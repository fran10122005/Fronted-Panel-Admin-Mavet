import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function AuthRoute() {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Podríamos mostrar un Skeleton o un Loader aquí
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  if (!token) {
    // Redirigir al signin, guardando la ruta intentada
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
