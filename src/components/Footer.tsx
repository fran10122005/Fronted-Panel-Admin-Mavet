export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-6 pb-4">
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-3 text-gray-300 dark:text-gray-600">
          <span className="h-px w-8 bg-gray-300 dark:bg-gray-700" />
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 12h-15m0 0l6.75-6.75M4.5 12l6.75 6.75" />
          </svg>
          <span className="h-px w-8 bg-gray-300 dark:bg-gray-700" />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide">
          Panel Administrativo MAVET — Museo de Artes Visuales y Espacios del Táchira
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed max-w-2xl mx-auto">
          Servicio Comunitario UNEFA — Anthony Cartier, Edgar Rivas, Gabriel Colina, María Conde, Samuel Roa y Francisco Rincón
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-1">
          &copy; {new Date().getFullYear()} MAVET
        </p>
      </div>
    </footer>
  );
}
