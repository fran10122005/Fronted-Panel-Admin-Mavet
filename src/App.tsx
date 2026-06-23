import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import { AuthProvider } from "./context/AuthContext";
import AuthRoute from "./components/auth/AuthRoute";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Ingresos from "./pages/Mavet/Ingresos";
import RegistroPublico from "./pages/Mavet/RegistroPublico";
import RRHH from "./pages/Mavet/RRHH";
import Recepcion from "./pages/Mavet/Recepcion";
import Biblioteca from "./pages/Mavet/Biblioteca";
import Asistencia from "./pages/Mavet/Asistencia";
import InventarioBoveda from "./pages/Mavet/InventarioBoveda";
import Talleres from "./pages/Mavet/Talleres";
import Auditorio from "./pages/Mavet/Auditorio";
import Educacion from "./pages/Mavet/Educacion";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster 
          position="top-center" 
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
        <Routes>
          {/* --- GRUPO 1: RUTAS CON MENÚ LATERAL (ADMIN) --- */}
          <Route element={<AuthRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />

          {/* Módulos específicos del MAVET */}
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/rrhh" element={<RRHH />} />
          <Route path="/recepcion" element={<Recepcion />} />
          <Route path="/educacion" element={<Educacion />} />


          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/inventario-obras" element={<InventarioBoveda />} />
            <Route path="/talleres" element={<Talleres />} />
            <Route path="/auditorio" element={<Auditorio />} />
          </Route>
        </Route>

        {/* --- GRUPO 2: RUTAS PÚBLICAS (SIN MENÚ - PARA EL QR) --- */}
        <Route path="/registro-visitante" element={<RegistroPublico />} />
        <Route path="/asistencia" element={<Asistencia />} />

        {/* --- GRUPO 3: AUTENTICACIÓN Y ERRORES --- */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}