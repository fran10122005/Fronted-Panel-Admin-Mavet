import { useTourContext } from "../context/TourContext";
import { useLocation } from "react-router";

const TourFab = () => {
  const { startGlobalTour, startPageTour, isTourActive } = useTourContext();
  const location = useLocation();

  const handleClick = () => {
    if (isTourActive) return;
    if (location.pathname === "/") {
      startGlobalTour();
    } else if (location.pathname === "/talleres" || location.pathname === "/biblioteca") {
      const activeTab = document.querySelector('[data-tour^="tab-"].border-brand-500');
      if (activeTab) {
        const tabId = activeTab.getAttribute("data-tour")?.replace("tab-", "");
        startPageTour(location.pathname, tabId || undefined);
      } else {
        startPageTour(location.pathname);
      }
    } else if (location.pathname === "/rrhh") {
      const activeTab = document.querySelector('[data-tour^="tab-"].shadow-sm');
      if (activeTab) {
        const tabId = activeTab.getAttribute("data-tour")?.replace("tab-", "");
        startPageTour(location.pathname, tabId || undefined);
      } else {
        startPageTour(location.pathname);
      }
    } else {
      startPageTour(location.pathname);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-brand-600 bg-white/90 dark:bg-gray-950/60 border border-gray-300 dark:border-gray-700 rounded-lg transition-all duration-300 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:scale-105 active:scale-95 shadow-theme-xs shrink-0"
      aria-label="Tutorial"
      title="Tutorial"
    >
      <svg
        className="size-4.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
        />
      </svg>
    </button>
  );
};

export default TourFab;