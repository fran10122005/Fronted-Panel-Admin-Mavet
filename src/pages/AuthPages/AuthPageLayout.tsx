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
      {/* Ornamentos decorativos — solo mobile */}
      <div className="absolute inset-0 bg-[url('/images/shape/grid-01.svg')] bg-center opacity-[0.04] dark:opacity-[0.03] pointer-events-none z-0 lg:hidden" />
      <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-brand-700/20 rounded-full blur-3xl pointer-events-none z-0 lg:hidden dark:hidden" />
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-brand-800/15 rounded-full blur-3xl pointer-events-none z-0 lg:hidden dark:hidden" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none z-0 lg:hidden dark:hidden" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none z-0 hidden dark:block lg:hidden" />
      <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none z-0 hidden dark:block lg:hidden" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gray-800/30 rounded-full blur-3xl pointer-events-none z-0 hidden dark:block lg:hidden" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 hidden dark:block lg:hidden" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent dark:from-white/[0.01] pointer-events-none z-0 lg:hidden" />

      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row z-10">
        <div className="flex flex-col flex-1">
          {/* Logo MAVET arriba del formulario — solo mobile */}
          <div className="flex justify-center pt-12 pb-2 lg:hidden">
            <Link to="/">
              <img
                src="/images/logo/mavet2.png"
                alt="Logo MAVET"
                className="h-16 sm:h-20 w-auto object-contain brightness-0 invert"
              />
            </Link>
          </div>
          <div className="flex flex-col justify-center flex-1">
            {children}
          </div>
          {/* Copyright — solo mobile */}
          <div className="text-center pb-6 lg:hidden">
            <p className="text-white/60 dark:text-white/50 text-xs tracking-wide">
              &copy;2026 MAVET &mdash; Museo de Artes Visuales y del Estado T&aacute;chira
            </p>
          </div>
        </div>
        {/* Panel decorativo derecho — solo desktop */}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid shine"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                 radial-gradient(circle at 30% 70%, rgba(128,0,0,0.15) 0%, transparent 50%),
                 radial-gradient(circle at 70% 20%, rgba(196,163,90,0.08) 0%, transparent 40%)
               `,
               backgroundSize: '60px 60px, 60px 60px, 100% 100%, 100% 100%'
             }}>
          <div className="relative flex items-center justify-center z-10">
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
