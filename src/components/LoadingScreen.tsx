import { useEffect, useState, useRef } from "react";
import { wakeUpBackend } from "../services/api/client";

const LOADING_MESSAGES = [
  "Despertando el servidor...",
  "Conectando con la base de datos...",
  "Preparando el panel de control...",
  "Cargando configuración...",
  "Aplicando los últimos ajustes...",
  "¡Bienvenido al Sistema MAVET!",
];

const MESSAGE_INTERVAL = 4500;

interface LoadingScreenProps {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const calledRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const step = 100 / (60 / 0.1);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? prev : Math.min(prev + step, 95)));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    wakeUpBackend().then(() => {
      setProgress(100);
      setDone(true);
      setTimeout(onFinish, 900);
    });
  }, [onFinish]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="mb-8 transition-all duration-700" style={{ opacity: done ? 0 : 1 }}>
        <img
          src="/images/logo/logo_mavet.png"
          alt="MAVET"
          className="h-36 w-auto object-contain"
        />
      </div>

      <div className="relative mb-6">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-brand-500 dark:bg-brand-400" />
        </div>
      </div>

      <p className="text-lg font-medium text-gray-700 transition-opacity duration-500 dark:text-gray-300">
        {LOADING_MESSAGES[messageIndex]}
      </p>

      <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out dark:bg-brand-400"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
