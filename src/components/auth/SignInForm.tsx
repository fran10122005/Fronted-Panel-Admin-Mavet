import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { useAuth } from "../../context/AuthContext";
import { mavetApi } from "../../services/api";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      await login(email, password);
      const from = location.state?.from?.pathname || "/";
      const search = location.state?.from?.search || "";
      navigate(from + search, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales incorrectas. Verifique su correo o contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsSending(true);
    try {
      await mavetApi.resetPasswordUsuario(forgotEmail);
      toast.success("Si el correo está registrado, recibirás una contraseña temporal.");
      setShowForgotModal(false);
    } catch (err: any) {
      toast.error(err.message || "Error al enviar la solicitud. Intente de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-10">
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 aside-gradient shadow-theme-lg">
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="mb-2 font-bold text-gray-900 text-3xl dark:text-white/90">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  <Label>
                    Correo Electrónico <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    type="email"
                    placeholder="ejemplo@correo.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Mantener sesión iniciada
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
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

      <Modal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} className="p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10 mb-4">
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Recuperar Contraseña
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresa tu correo electrónico y te enviaremos una contraseña temporal.
          </p>
        </div>
        <form onSubmit={handleForgotPassword}>
          <div className="space-y-4">
            <div>
              <Label>Correo Electrónico <span className="text-error-500">*</span></Label>
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                disabled={isSending}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <Button className="w-full sm:w-auto" size="sm" disabled={isSending}>
                {isSending ? "Enviando..." : "Enviar Contraseña Temporal"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
