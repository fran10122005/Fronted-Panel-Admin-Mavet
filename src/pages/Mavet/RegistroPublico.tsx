import React from "react";

interface Props {
  tipo: "visitante" | "trabajador";
}

const RegistroPublico: React.FC<Props> = ({ tipo }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {tipo === "visitante" ? "Bienvenido al MAVET" : "Control de Asistencia"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Por favor, rellene los datos para ingresar</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("¡Registro Exitoso!"); }}>
          {tipo === "visitante" ? (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium">Nombre Completo</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Ej: Juan Pérez" required />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Cedula</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Ej: V-31434151" required />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Telefono</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Ej: 0412-7666666" required />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Edad</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Ej: 18" required />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Institucion</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Ej: UNEFA" required />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Profesion</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Ej: Maesttro" required />
              </div>
            </>
          ) : (
            <div>
              <label className="block mb-2 text-sm font-medium">Cédula de Identidad</label>
              <input type="text" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Ej: V-12345678" required />
            </div>
          )}
          
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            {tipo === "visitante" ? "Registrar Visita" : "Marcar Entrada/Salida"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroPublico;