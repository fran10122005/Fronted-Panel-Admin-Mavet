export default function Footer() {
  return (
    <footer className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4 pb-2">
      <div className="text-center space-y-1">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Panel Administrativo MAVET — Museo de Artes Visuales y Espacios del Táchira
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Servicio Comunitario UNEFA — Anthony Cartier, Edgar Rivas, Gabriel Colina, María Conde, Samuel Roa y Francisco Rincón
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} MAVET
        </p>
      </div>
    </footer>
  );
}
