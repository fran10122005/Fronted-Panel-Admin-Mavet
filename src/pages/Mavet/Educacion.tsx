import React, { useState } from "react";
import Talleres from "./Talleres";
import Auditorio from "./Auditorio";

export default function Educacion() {
  const [activeTab, setActiveTab] = useState<"talleres" | "auditorio">("talleres");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Módulo de Educación</h1>
          <p className="text-sm text-gray-500">Gestión de talleres, cursos y reservas del auditorio.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("talleres")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "talleres"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Talleres y Cursos
          </button>
          <button
            onClick={() => setActiveTab("auditorio")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "auditorio"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Solicitudes de Auditorio
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "talleres" && <Talleres />}
        {activeTab === "auditorio" && <Auditorio />}
      </div>
    </div>
  );
}
