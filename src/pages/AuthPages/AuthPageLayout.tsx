import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-gray-950 dark:from-gray-950 dark:via-black dark:to-gray-900 lg:bg-white lg:dark:bg-gray-900 overflow-hidden">
      {/* Grid pattern overlay — solo en responsive */}
      <div className="absolute inset-0 bg-[url('/images/shape/grid-01.svg')] bg-center opacity-[0.04] dark:opacity-[0.03] pointer-events-none z-0 lg:hidden" />
      {/* Decorative blur orbs — modo claro */}
      <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-brand-700/20 rounded-full blur-3xl pointer-events-none z-0 lg:hidden dark:hidden" />
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-brand-800/15 rounded-full blur-3xl pointer-events-none z-0 lg:hidden dark:hidden" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none z-0 lg:hidden dark:hidden" />
      {/* Decorative blur orbs — modo oscuro */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none z-0 hidden dark:block lg:hidden" />
      <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none z-0 hidden dark:block lg:hidden" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gray-800/30 rounded-full blur-3xl pointer-events-none z-0 hidden dark:block lg:hidden" />
      {/* Noise texture overlay — solo modo oscuro */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 hidden dark:block lg:hidden" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent dark:from-white/[0.01] pointer-events-none z-0 lg:hidden" />

      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row z-10">
        <div className="flex flex-col flex-1">
          {children}
          {/* Copyright — solo en responsive */}
          <div className="text-center pb-6 lg:hidden">
            <p className="text-white/60 dark:text-white/50 text-xs tracking-wide">
              &copy;2026 MAVET &mdash; Museo de Artes Visuales y del Estado T&aacute;chira
            </p>
          </div>
        </div>
        <div className="items-center hidden w-full h-full lg:w-1/2 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-2">
                <img
                  src="/images/logo/mavet2.png"
                  alt="Logo MAVET"
                  className="max-h-24 w-auto object-contain"
                />
              </Link>
              <span className="text-center text-xs uppercase tracking-wider text-gray-400 dark:text-white/60 font-bold mb-4 leading-tight">
                museo de artes visuales y del estado táchira
              </span>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Panel de Administración
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
