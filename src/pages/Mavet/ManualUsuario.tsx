import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import manualPdfUrl from "../../../Manual_MAVET_Guia_Visual_Estilo_Instructivo_CORREGIDO.pdf?url";

export default function ManualUsuario() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"descargando" | "exito">("descargando");

  useEffect(() => {
    const link = document.createElement("a");
    link.href = manualPdfUrl;
    link.download = "Manual_MAVET.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const exitoTimeout = setTimeout(() => {
      setEstado("exito");
    }, 500);

    const redirectTimeout = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);

    return () => {
      clearTimeout(exitoTimeout);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        {estado === "descargando" ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Descargando manual...
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Serás redirigido al inicio en unos segundos.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-900 dark:text-white text-lg font-semibold">
              ¡Manual descargado exitosamente!
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Revisa la carpeta de descargas de tu navegador.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Serás redirigido al inicio...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
