import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import { AuthProvider } from "./context/AuthContext";
import AuthRoute from "./components/auth/AuthRoute";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
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
        <Routes>
          {/* --- GRUPO 1: RUTAS CON MENÚ LATERAL (ADMIN) --- */}
          <Route element={<AuthRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />

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