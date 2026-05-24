import React, { useState } from "react";

const Ingresos: React.FC = () => {
  // Este estado controla qué pestaña está activa
  const [pestanaActiva, setPestanaActiva] = useState<"visitantes" | "trabajadores">("visitantes");

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Registro de Ingresos - MAVET
        </h3>
      </div>

      {/* Controles de Pestañas */}
      <div className="flex border-b border-stroke dark:border-strokedark">
        <button
          className={`w-1/2 py-4 font-medium ${
            pestanaActiva === "visitantes"
              ? "text-primary border-b-2 border-primary"
              : "text-bodydark hover:text-black dark:hover:text-white"
          }`}
          onClick={() => setPestanaActiva("visitantes")}
        >
          👤 Ingreso de Visitantes
        </button>
        <button
          className={`w-1/2 py-4 font-medium ${
            pestanaActiva === "trabajadores"
              ? "text-primary border-b-2 border-primary"
              : "text-bodydark hover:text-black dark:hover:text-white"
          }`}
          onClick={() => setPestanaActiva("trabajadores")}
        >
          💼 Reloj de Trabajadores
        </button>
      </div>

      {/* Área del Formulario */}
      <div className="p-6.5">
        {pestanaActiva === "visitantes" ? (
          // Formulario para Visitantes
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">Nombre o Grupo Escolar</label>
              <input type="text" placeholder="Ej. Colegio San José o Juan Pérez" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2.5 block text-black dark:text-white">Cantidad de personas</label>
              <input type="number" defaultValue="1" min="1" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray">
              Registrar Visita
            </button>
          </div>
        ) : (
          // Formulario para Trabajadores
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">Cédula del Trabajador</label>
              <input type="text" placeholder="Ingrese número de cédula" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div className="flex gap-4 mt-2">
              <button className="flex w-1/2 justify-center rounded bg-success p-3 font-medium text-white hover:bg-opacity-90">
                Marcar Entrada
              </button>
              <button className="flex w-1/2 justify-center rounded bg-danger p-3 font-medium text-white hover:bg-opacity-90">
                Marcar Salida
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ingresos;
