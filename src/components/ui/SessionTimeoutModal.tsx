import { useEffect, useState } from "react";

interface Props {
  show: boolean;
  onExtend: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutModal({ show, onExtend, onLogout }: Props) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!show) {
      setCountdown(60);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [show, onLogout]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sesión próxima a expirar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Por inactividad, su sesión se cerrará en <span className="font-semibold text-yellow-600 dark:text-yellow-400">{countdown}</span> segundos.
            </p>
          </div>
        </div>
        <p className="mb-5 text-xs text-gray-400 dark:text-gray-500">
          Si no responde, deberá iniciar sesión nuevamente. La información no guardada se perderá.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cerrar sesión ahora
          </button>
          <button
            onClick={onExtend}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600"
          >
            Continuar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
