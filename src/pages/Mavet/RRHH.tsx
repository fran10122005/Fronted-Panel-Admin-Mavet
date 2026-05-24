export default function RRHH() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recursos Humanos y Personal</h1>

      {/* Formulario de Registro */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Registro de Nuevo Trabajador</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. Juan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input type="text" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. Pérez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input type="text" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. V-12345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="tel" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. 0414-1234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="ejemplo@correo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <select className="w-full border border-gray-400 rounded px-3 py-2 bg-white focus:border-blue-600 focus:outline-none">
                <option value="">Seleccione un cargo...</option>
                <option value="curador">Curador</option>
                <option value="bibliotecario">Bibliotecario</option>
                <option value="seguridad">Seguridad</option>
                <option value="administrador">Administrador</option>
                <option value="guia">Guía de Museo</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="button" className="bg-blue-800 text-white font-semibold py-2 px-6 rounded hover:bg-blue-900 border border-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-none">
              Guardar y Generar Código QR
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Asistencia */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-300 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Asistencia Reciente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm border-b-2 border-gray-400">
                <th className="px-4 py-3 font-semibold">Trabajador</th>
                <th className="px-4 py-3 font-semibold">Entrada Mañana</th>
                <th className="px-4 py-3 font-semibold">Salida Mañana</th>
                <th className="px-4 py-3 font-semibold">Entrada Tarde</th>
                <th className="px-4 py-3 font-semibold">Salida Tarde</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 text-sm">
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">María González</td>
                <td className="px-4 py-3">08:00 AM</td>
                <td className="px-4 py-3">12:05 PM</td>
                <td className="px-4 py-3">01:55 PM</td>
                <td className="px-4 py-3">05:00 PM</td>
              </tr>
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">Carlos Ruiz</td>
                <td className="px-4 py-3 text-red-700 font-medium">08:15 AM (Tarde)</td>
                <td className="px-4 py-3">12:00 PM</td>
                <td className="px-4 py-3">02:00 PM</td>
                <td className="px-4 py-3">05:05 PM</td>
              </tr>
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">Ana López</td>
                <td className="px-4 py-3">07:55 AM</td>
                <td className="px-4 py-3">12:10 PM</td>
                <td className="px-4 py-3 text-red-700 font-medium">02:20 PM (Tarde)</td>
                <td className="px-4 py-3 text-gray-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-gray-300 bg-gray-50 text-right">
           <span className="text-sm text-gray-600">Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
