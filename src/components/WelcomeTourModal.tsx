import { useEffect } from "react";
import { useTourContext } from "../context/TourContext";

const WelcomeTourModal = () => {
  const { startGlobalTour, hasSeenTour, markTourAsSeen } = useTourContext();

  useEffect(() => {
    if (hasSeenTour) return;

    const timer = setTimeout(() => {
      const overlay = document.getElementById("welcome-tour-overlay");
      if (overlay) {
        overlay.classList.remove("opacity-0");
        overlay.classList.add("opacity-100");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [hasSeenTour]);

  if (hasSeenTour) return null;

  return (
    <div
      id="welcome-tour-overlay"
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 opacity-0"
    >
      <div className="mx-4 w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 sm:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
            <svg
              className="size-8 text-brand-600 dark:text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.75 6.75 0 0 0 6.75-6.75M12 18l-2.25-2.25M12 18l2.25-2.25M12 12.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
              />
            </svg>
          </div>

          <h2 className="mb-2 font-outfit text-2xl font-bold text-gray-900 dark:text-white">
            ¡Bienvenido al Panel MAVET!
          </h2>
          <p className="font-outfit text-base text-gray-500 dark:text-gray-400">
            Te guiaremos a través de las secciones principales para que puedas
            aprovechar al máximo el sistema de gestión del museo.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3">
          {[
            { label: "Dashboard", desc: "Indicadores clave" },
            { label: "Auditorio", desc: "Reservas y eventos" },
            { label: "Recepción", desc: "Control de ingresos" },
            { label: "Talleres", desc: "Gestión formativa" },
            { label: "Bóveda", desc: "Inventario de obras" },
            { label: "Biblioteca", desc: "Catálogo y préstamos" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center dark:border-gray-700 dark:bg-gray-900/50"
            >
              <p className="font-outfit text-sm font-semibold text-gray-800 dark:text-gray-200">
                {item.label}
              </p>
              <p className="font-outfit text-xs text-gray-400 dark:text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              markTourAsSeen();
              setTimeout(() => startGlobalTour(), 100);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-outfit text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-700 hover:shadow-xl active:scale-[0.98]"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
            Comenzar tour guiado
          </button>

          <button
            onClick={markTourAsSeen}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3 font-outfit text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            Explorar por mi cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTourModal;
