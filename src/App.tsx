import { lazy, Suspense, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";

// Eagerly loaded core components
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import { AuthProvider } from "./context/AuthContext";
import AuthRoute from "./components/auth/AuthRoute";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";

// Lazy loaded pages (Code Splitting)
const Home = lazy(() => import("./pages/Dashboard/Home"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Ingresos = lazy(() => import("./pages/Mavet/Ingresos"));
const RegistroPublico = lazy(() => import("./pages/Mavet/RegistroPublico"));
const RRHH = lazy(() => import("./pages/Mavet/RRHH"));
const Recepcion = lazy(() => import("./pages/Mavet/Recepcion"));
const AsistenciaPersonal = lazy(() => import("./pages/Mavet/AsistenciaPersonal"));
const Biblioteca = lazy(() => import("./pages/Mavet/Biblioteca"));
const InventarioBoveda = lazy(() => import("./pages/Mavet/InventarioBoveda"));
const Talleres = lazy(() => import("./pages/Mavet/Talleres"));
const Auditorio = lazy(() => import("./pages/Mavet/Auditorio"));
const Educacion = lazy(() => import("./pages/Mavet/Educacion"));
const Papelera = lazy(() => import("./pages/Mavet/Papelera"));
const ManualUsuario = lazy(() => import("./pages/Mavet/ManualUsuario"));
const AuditLogs = lazy(() => import("./pages/Mavet/AuditLogs"));
const Catalogos = lazy(() => import("./pages/Mavet/Catalogos"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));

// Fallback loader for Suspense
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [showLoading, setShowLoading] = useState(true);

  if (showLoading) {
    return <LoadingScreen onFinish={() => setShowLoading(false)} />;
  }

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster 
          position="top-center"
          containerStyle={{ zIndex: 2147483647 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '0.5rem',
              fontWeight: '500',
            },
            success: {
              style: {
                border: '1px solid #bbf7d0', // green-200
                background: '#f0fdf4',       // green-50
                color: '#166534',            // green-800
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                border: '1px solid #fecaca', // red-200
                background: '#fef2f2',       // red-50
                color: '#991b1b',            // red-800
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              style: {
                border: '1px solid #bfdbfe', // blue-200
                background: '#eff6ff',       // blue-50
                color: '#1e40af',            // blue-800
              },
            }
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* --- GRUPO 1: RUTAS CON MENÚ LATERAL (ADMIN) --- */}
            <Route element={<AuthRoute />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<Home />} />
                <Route path="/profile" element={<UserProfiles />} />

                {/* Módulos específicos del MAVET */}
                <Route element={<RoleProtectedRoute modulo="biblioteca" allowedRoles={["Bibliotecario", "Bibliotecaria", "Gerente"]} />}>
                  <Route path="/biblioteca" element={<ErrorBoundary><Biblioteca /></ErrorBoundary>} />
                </Route>
                <Route element={<RoleProtectedRoute modulo="rrhh" allowedRoles={["Gerente"]} />}>
                  <Route path="/rrhh" element={<ErrorBoundary><RRHH /></ErrorBoundary>} />
                </Route>
                <Route element={<RoleProtectedRoute modulo="recepcion" allowedRoles={["Recepcionista", "Gerente"]} />}>
                  <Route path="/recepcion" element={<ErrorBoundary><Recepcion /></ErrorBoundary>} />
                  <Route path="/ingresos" element={<ErrorBoundary><Ingresos /></ErrorBoundary>} />
                </Route>
                <Route element={<RoleProtectedRoute modulo="talleres" allowedRoles={["Educador", "Educación", "Gerente"]} />}>
                  <Route path="/educacion" element={<ErrorBoundary><Educacion /></ErrorBoundary>} />
                  <Route path="/talleres" element={<ErrorBoundary><Talleres /></ErrorBoundary>} />
                  <Route path="/auditorio" element={<ErrorBoundary><Auditorio /></ErrorBoundary>} />
                </Route>
                <Route element={<RoleProtectedRoute modulo="inventario_obras" allowedRoles={["Curador", "Restaurador", "Gerente"]} />}>
                  <Route path="/inventario-obras" element={<ErrorBoundary><InventarioBoveda /></ErrorBoundary>} />
                </Route>
                {/* Ruta de Papelera (solo Admin) */}
                <Route element={<RoleProtectedRoute modulo="papelera" allowedRoles={[]} />}>
                  <Route path="/papelera" element={<Papelera />} />
                </Route>
                {/* Manual de Usuario (todos los roles autenticados) */}
                <Route path="/manual" element={<ManualUsuario />} />
                {/* Asistencia (solo Admin, Gerente y Recepcionista) */}
                <Route element={<RoleProtectedRoute modulo="asistencia" allowedRoles={["Gerente", "Recepcionista"]} />}>
                  <Route path="/asistencia" element={<ErrorBoundary><AsistenciaPersonal /></ErrorBoundary>} />
                </Route>
                {/* Auditoría (solo administradores y gerentes) */}
                <Route element={<RoleProtectedRoute modulo="auditoria" allowedRoles={["Administrador", "Gerente"]} />}>
                  <Route path="/auditoria" element={<AuditLogs />} />
                </Route>

                {/* Catálogos del Sistema (solo Admin y Gerente) */}
                <Route element={<RoleProtectedRoute modulo="catalogos" allowedRoles={["Administrador", "Gerente"]} />}>
                  <Route path="/catalogos" element={<ErrorBoundary><Catalogos /></ErrorBoundary>} />
                </Route>
              </Route>
            </Route>

            {/* --- GRUPO 2: RUTAS PÚBLICAS (SIN MENÚ) --- */}
            <Route path="/registro-visitante" element={<ErrorBoundary><RegistroPublico /></ErrorBoundary>} />

            {/* --- GRUPO 3: AUTENTICACIÓN Y ERRORES --- */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}