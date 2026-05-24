export default function Colecciones() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventario de Colecciones</h1>
        <div className="flex gap-2">
          <button className="bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded border border-gray-400 hover:bg-gray-200">
            Registrar Requisito de Exposición
          </button>
          <button className="bg-blue-800 text-white font-semibold py-2 px-4 rounded border border-blue-900 hover:bg-blue-900">
            Registrar Donación
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase text-xs border-b-2 border-gray-400">
                <th className="px-4 py-3 font-bold">Imagen</th>
                <th className="px-4 py-3 font-bold">Código</th>
                <th className="px-4 py-3 font-bold">Título</th>
                <th className="px-4 py-3 font-bold">Autor</th>
                <th className="px-4 py-3 font-bold">Medidas</th>
                <th className="px-4 py-3 font-bold">Año</th>
                <th className="px-4 py-3 font-bold">Técnica</th>
                <th className="px-4 py-3 font-bold">Modalidad</th>
                <th className="px-4 py-3 font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="text-gray-900 text-sm">
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 bg-gray-200 border border-gray-400 rounded flex items-center justify-center overflow-hidden">
                    <span className="text-gray-500 text-xs">Img</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">OBR-001</td>
                <td className="px-4 py-3 font-medium">Paisaje Andino</td>
                <td className="px-4 py-3">Manuel Otero</td>
                <td className="px-4 py-3">120x80 cm</td>
                <td className="px-4 py-3">1998</td>
                <td className="px-4 py-3">Óleo sobre lienzo</td>
                <td className="px-4 py-3">Pintura</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-xs font-bold">En Exhibición</span>
                </td>
              </tr>
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 bg-gray-200 border border-gray-400 rounded flex items-center justify-center overflow-hidden">
                    <span className="text-gray-500 text-xs">Img</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">OBR-002</td>
                <td className="px-4 py-3 font-medium">Busto de Bolívar</td>
                <td className="px-4 py-3">Desconocido</td>
                <td className="px-4 py-3">50x40x30 cm</td>
                <td className="px-4 py-3">1950</td>
                <td className="px-4 py-3">Bronce</td>
                <td className="px-4 py-3">Escultura</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-gray-200 text-gray-800 border border-gray-400 rounded text-xs font-bold">Bóveda</span>
                </td>
              </tr>
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 bg-gray-200 border border-gray-400 rounded flex items-center justify-center overflow-hidden">
                    <span className="text-gray-500 text-xs">Img</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">OBR-003</td>
                <td className="px-4 py-3 font-medium">Abstracto I</td>
                <td className="px-4 py-3">Luisa Cáceres</td>
                <td className="px-4 py-3">90x90 cm</td>
                <td className="px-4 py-3">2015</td>
                <td className="px-4 py-3">Acrílico</td>
                <td className="px-4 py-3">Pintura</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-xs font-bold">En Revisión</span>
                </td>
              </tr>
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 bg-gray-200 border border-gray-400 rounded flex items-center justify-center overflow-hidden">
                    <span className="text-gray-500 text-xs">Img</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">OBR-004</td>
                <td className="px-4 py-3 font-medium">Tejido Tradicional</td>
                <td className="px-4 py-3">Comunidad Indígena</td>
                <td className="px-4 py-3">200x150 cm</td>
                <td className="px-4 py-3">2020</td>
                <td className="px-4 py-3">Algodón y tintes</td>
                <td className="px-4 py-3">Textil</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded text-xs font-bold">Préstamo</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-gray-300 bg-gray-50 flex justify-between items-center text-sm text-gray-700">
           <span>Mostrando 4 de 124 obras</span>
           <div className="flex gap-1">
             <button className="px-3 py-1 border border-gray-400 rounded bg-white hover:bg-gray-100">&lt; Anterior</button>
             <button className="px-3 py-1 border border-gray-400 rounded bg-white hover:bg-gray-100">Siguiente &gt;</button>
           </div>
        </div>
      </div>
    </div>
  );
}
