interface Props {
  trabajador: { nombres: string; apellidos: string; cedula: string };
  serverTime: string;
  tipoMovimiento: string;
  isSubmitting: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ETIQUETA: Record<string, { label: string; color: string }> = {
  Entrada: { label: "ENTRADA", color: "green" },
  Salida: { label: "SALIDA", color: "red" },
};

export default function ConfirmacionScreen({
  trabajador,
  serverTime,
  tipoMovimiento,
  isSubmitting,
  onConfirmar,
  onCancelar,
}: Props) {
  const meta = tipoMovimiento ? ETIQUETA[tipoMovimiento] : null;
  const fechaHora = new Date(serverTime);
  const fecha = fechaHora.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hora = fechaHora.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {trabajador.nombres} {trabajador.apellidos}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{trabajador.cedula}</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Fecha y hora</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{fecha}</p>
        <p className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">{hora}</p>
      </div>

      {meta && (
        <div className={`text-center p-4 rounded-xl border-2 ${
          meta.color === "green"
            ? "bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700"
            : "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700"
        }`}>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Tipo de registro
          </p>
          <p className={`text-2xl font-black ${
            meta.color === "green"
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          }`}>
            {meta.label}
          </p>
        </div>
      )}

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Confirme su {meta?.label?.toLowerCase() || "registro"} - {hora}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancelar}
          disabled={isSubmitting}
          className="flex-1 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 text-lg"
        >
          CANCELAR
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          disabled={isSubmitting}
          className={`flex-1 p-4 border-2 rounded-xl font-bold text-white transition disabled:opacity-60 text-lg ${
            meta?.color === "green"
              ? "bg-green-600 border-green-600 hover:bg-green-700"
              : "bg-red-600 border-red-600 hover:bg-red-700"
          }`}
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            "CONFIRMAR"
          )}
        </button>
      </div>
    </div>
  );
}
