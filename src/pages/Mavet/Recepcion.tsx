export default function Recepcion() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Recepción y Visitantes</h1>

      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Check-in Rápido de Visitantes</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula o Pasaporte</label>
              <input type="text" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. V-12345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
              <input type="number" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. 25" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. Ana" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input type="text" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. Silva" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="tel" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. 0424-1234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institución / Profesión</label>
              <input type="text" className="w-full border border-gray-400 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej. Estudiante LUZ" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-800 mb-1">Motivo de Visita *</label>
              <select className="w-full border border-gray-400 rounded px-3 py-2 bg-white focus:border-blue-600 focus:outline-none text-lg">
                <option value="">Seleccione el motivo de la visita...</option>
                <option value="general">Visita General</option>
                <option value="taller_pintura">Taller de Pintura</option>
                <option value="taller_escultura">Taller de Escultura</option>
                <option value="evento_auditorio">Evento en Auditorio</option>
                <option value="investigacion">Investigación Biblioteca</option>
              </select>
            </div>
          </div>
          <div className="pt-6 border-t mt-6 flex justify-between items-center">
            <div className="text-gray-600 text-sm font-mono bg-gray-100 px-3 py-1 rounded border border-gray-300">
              Hora de registro: <span className="font-bold text-gray-900">10:42:15 AM</span>
            </div>
            <button type="button" className="bg-blue-800 text-white font-bold py-3 px-8 rounded shadow hover:bg-blue-900 border border-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-none text-lg">
              Registrar Ingreso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
