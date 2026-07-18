import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mavetApi } from "../services/api";

interface User {
  id_usuario?: number;
  nombre_usuario?: string;
  correo?: string;
  rol?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (newUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = async () => {
    try {
      const res = await mavetApi.getMe();
      if (res && res.usuario) {
        setUser(res.usuario);
        setToken("authenticated");
        localStorage.setItem("user", JSON.stringify(res.usuario));
      }
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
      setToken("authenticated");
    }
    isAuthenticated();
  }, []);

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const login = async (correo: string, password: string) => {
    const data = await mavetApi.login(correo, password);
    setToken("authenticated");
    setUser(data.usuario);
    localStorage.setItem("user", JSON.stringify(data.usuario));
  };

  const logout = async () => {
    try {
      await mavetApi.logout();
    } catch {
      // Even if logout API fails, clear local state
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function getUserRole(user: User | null): string {
  return user?.Role?.nombre_rol || user?.rol || "Administrador";
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      isLoading: true,
      login: async () => { throw new Error("AuthProvider no disponible"); },
      logout: () => {},
      updateUser: () => {},
    };
  }
  return context;
};
