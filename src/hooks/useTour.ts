import { useCallback, useRef } from "react";
import { driver, type DriveStep, type Config } from "driver.js";

interface UseTourOptions {
  showProgress?: boolean;
  animate?: boolean;
  overlayColor?: string;
  allowClose?: boolean;
  doneBtnText?: string;
  nextBtnText?: string;
  prevBtnText?: string;
  onFinish?: () => void;
  onClose?: () => void;
}

export const useTour = (options: UseTourOptions = {}) => {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const getDriver = useCallback(() => {
    if (!driverRef.current) {
      const config: Config = {
        animate: options.animate ?? true,
        allowClose: options.allowClose ?? true,
        showProgress: options.showProgress ?? true,
        doneBtnText: options.doneBtnText ?? "Finalizar",
        nextBtnText: options.nextBtnText ?? "Siguiente",
        prevBtnText: options.prevBtnText ?? "Anterior",
        overlayColor: options.overlayColor ?? "rgba(0, 0, 0, 0.5)",
        overlayClickBehavior: "close",
        smoothScroll: true,
        stagePadding: 10,
        stageRadius: 8,
        onDestroyed: () => {
          options.onClose?.();
        },
        onDoneClick: () => {
          driverRef.current?.destroy();
          driverRef.current = null;
          options.onFinish?.();
        },
      };

      driverRef.current = driver(config);
    }
    return driverRef.current;
  }, [options]);

  const startTour = useCallback(
    (steps: DriveStep[], startIndex?: number) => {
      const d = getDriver();
      d.setSteps(steps);
      d.drive(startIndex);
    },
    [getDriver]
  );

  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
  }, []);

  const destroy = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
  }, []);

  const isActive = useCallback(() => {
    return driverRef.current?.isActive() ?? false;
  }, []);

  const moveNext = useCallback(() => {
    driverRef.current?.moveNext();
  }, []);

  const movePrevious = useCallback(() => {
    driverRef.current?.movePrevious();
  }, []);

  const refresh = useCallback(() => {
    driverRef.current?.refresh();
  }, []);

  return {
    startTour,
    stopTour,
    destroy,
    isActive,
    moveNext,
    movePrevious,
    refresh,
  };
};
