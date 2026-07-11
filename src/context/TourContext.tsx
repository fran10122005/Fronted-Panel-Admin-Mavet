import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useTour } from "../hooks/useTour";
import { globalTourSteps, pageTourSteps } from "../config/tourSteps";

interface TourContextType {
  isTourActive: boolean;
  startGlobalTour: () => void;
  startPageTour: (path: string) => void;
  stopTour: () => void;
  hasSeenTour: boolean;
  markTourAsSeen: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = "mavet_tour_seen";

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  });

  const tour = useTour({
    showProgress: true,
    doneBtnText: "Finalizar",
    nextBtnText: "Siguiente",
    prevBtnText: "Anterior",
    onFinish: () => {
      markTourAsSeen();
    },
  });

  const startGlobalTour = useCallback(() => {
    tour.startTour(globalTourSteps);
  }, [tour]);

  const startPageTour = useCallback(
    (path: string) => {
      const steps = pageTourSteps[path];
      if (steps && steps.length > 0) {
        tour.startTour(steps);
      }
    },
    [tour]
  );

  const stopTour = useCallback(() => {
    tour.stopTour();
  }, [tour]);

  const markTourAsSeen = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setHasSeenTour(true);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setHasSeenTour(false);
  }, []);

  return (
    <TourContext.Provider
      value={{
        isTourActive: tour.isActive(),
        startGlobalTour,
        startPageTour,
        stopTour,
        hasSeenTour,
        markTourAsSeen,
        resetTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTourContext = (): TourContextType => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTourContext must be used within a TourProvider");
  }
  return context;
};
