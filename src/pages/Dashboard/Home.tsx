import { useAuth, getUserRole } from "../../context/AuthContext";
import GerenteDashboard from "./GerenteDashboard";
import RecepcionistaDashboard from "./RecepcionistaDashboard";
import BibliotecarioDashboard from "./BibliotecarioDashboard";
import EducadorDashboard from "./EducadorDashboard";
import CuradorDashboard from "./CuradorDashboard";

export default function Home() {
  const { user } = useAuth();
  const role = getUserRole(user);

  switch (role) {
    case "Recepcionista":
      return <RecepcionistaDashboard />;
    case "Bibliotecario":
    case "Bibliotecaria":
      return <BibliotecarioDashboard />;
    case "Educador":
    case "Educación":
      return <EducadorDashboard />;
    case "Curador":
    case "Restaurador":
      return <CuradorDashboard />;
    case "Gerente":
    case "Administrador":
    case "admin":
    default:
      return <GerenteDashboard />;
  }
}
