import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
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
import Colecciones from "./pages/Mavet/Colecciones";
import Recepcion from "./pages/Mavet/Recepcion";
import Biblioteca from "./pages/Mavet/Biblioteca";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* --- GRUPO 1: RUTAS CON MENÚ LATERAL (ADMIN) --- */}
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
          <Route path="/colecciones" element={<Colecciones />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/rrhh" element={<RRHH />} />
          <Route path="/recepcion" element={<Recepcion />} />
          <Route path="/educacion" element={<Blank />} />
          <Route path="/espacios" element={<Blank />} />
          
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/inventario-obras" element={<BasicTables />} /> 
          <Route path="/talleres" element={<FormElements />} />
          <Route path="/auditorio" element={<Calendar />} />
        </Route>

        {/* --- GRUPO 2: RUTAS PÚBLICAS (SIN MENÚ - PARA EL QR) --- */}
        <Route path="/registro-visitante" element={<RegistroPublico tipo="visitante" />} />
        <Route path="/registro-trabajador" element={<RegistroPublico tipo="trabajador" />} />

        {/* --- GRUPO 3: AUTENTICACIÓN Y ERRORES --- */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}