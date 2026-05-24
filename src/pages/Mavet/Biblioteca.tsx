export default function Biblioteca() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventario de Biblioteca</h1>
        <button className="bg-blue-800 text-white font-semibold py-2 px-4 rounded border border-blue-900 hover:bg-blue-900">
          Registrar Nuevo Libro
        </button>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase text-xs border-b-2 border-gray-400">
                <th className="px-4 py-3 font-bold">Unidad</th>
                <th className="px-4 py-3 font-bold">Título</th>
                <th className="px-4 py-3 font-bold">Autor</th>
                <th className="px-4 py-3 font-bold">Estante</th>
                <th className="px-4 py-3 font-bold text-center">Cantidad</th>
                <th className="px-4 py-3 font-bold text-center">Cuota</th>
                <th className="px-4 py-3 font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="text-gray-900 text-sm">
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">LIB-1001</td>
                <td className="px-4 py-3 font-medium">Historia del Arte Venezolano</td>
                <td className="px-4 py-3">Boulton, Alfredo</td>
                <td className="px-4 py-3">Estante A - Fila 2</td>
                <td className="px-4 py-3 text-center">3</td>
                <td className="px-4 py-3 text-center font-mono">1</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-xs font-bold">Aprobado</span>
                </td>
              </tr>
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">LIB-1002</td>
                <td className="px-4 py-3 font-medium">Técnicas de Restauración</td>
                <td className="px-4 py-3">Smith, John</td>
                <td className="px-4 py-3">Estante B - Fila 1</td>
                <td className="px-4 py-3 text-center">1</td>
                <td className="px-4 py-3 text-center font-mono">0</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-xs font-bold">Pendiente</span>
                </td>
              </tr>
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">LIB-1003</td>
                <td className="px-4 py-3 font-medium">Catálogo Exposición 1990</td>
                <td className="px-4 py-3">MAVET</td>
                <td className="px-4 py-3">Archivo Histórico</td>
                <td className="px-4 py-3 text-center">5</td>
                <td className="px-4 py-3 text-center font-mono">5</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-800 border border-red-300 rounded text-xs font-bold">Descartado/Venta</span>
                </td>
              </tr>
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">LIB-1004</td>
                <td className="px-4 py-3 font-medium">Color y Forma en la Escultura</td>
                <td className="px-4 py-3">García, Pedro</td>
                <td className="px-4 py-3">Estante C - Fila 4</td>
                <td className="px-4 py-3 text-center">2</td>
                <td className="px-4 py-3 text-center font-mono">1</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-xs font-bold">Aprobado</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-gray-300 bg-gray-50 flex justify-between items-center text-sm text-gray-700">
           <span>Mostrando 4 de 892 unidades</span>
           <div className="flex gap-1">
             <button className="px-3 py-1 border border-gray-400 rounded bg-white hover:bg-gray-100">&lt; Anterior</button>
             <button className="px-3 py-1 border border-gray-400 rounded bg-white hover:bg-gray-100">Siguiente &gt;</button>
           </div>
        </div>
      </div>
    </div>
  );
}
