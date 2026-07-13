import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/"); // Autenticación exitosa, ir al Dashboard
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales incorrectas. Verifique su correo o contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-10">
        <div className="p-6 sm:p-8 rounded-2xl glass-card dark:glass-card glow-brand dark:glow-white animate-fadeIn relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="mb-2 font-bold text-gray-900 text-3xl dark:text-white/90">
                Iniciar Sesión
              </h1>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Ingrese sus credenciales administrativas para acceder al sistema del MAVET.
              </p>
            </div>
            <div>
              
              {errorMsg && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-800 dark:text-gray-200">
                      Correo Electrónico <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input 
                      type="email"
                      placeholder="ejemplo@correo.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="placeholder:text-gray-600 dark:placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-200">
                      Contraseña <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="placeholder:text-gray-600 dark:placeholder:text-white/50"
                    />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-600 dark:fill-gray-300 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-600 dark:fill-gray-300 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="block font-normal text-gray-900 text-theme-sm dark:text-gray-200">
                        Mantener sesión iniciada
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full py-3" size="sm" disabled={isLoading}>
                      {isLoading ? "Verificando credenciales..." : "Entrar al Sistema"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
