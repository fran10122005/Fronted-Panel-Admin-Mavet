# MAVET - Sistema Administrativo del Museo de Artes Visuales y del Espacio del Táchira

Este repositorio contiene el sistema integral de gestión y administración para el **MAVET**, desarrollado como un Panel Administrativo moderno basado en React, TypeScript y Tailwind CSS.

## Módulos Principales

El sistema ha sido estructurado para satisfacer las necesidades específicas de la institución:

1. **Dashboard Principal**: Estadísticas globales del museo (Obras, Libros, Visitantes, Eventos).
2. **Inventario de Bóveda**: Control riguroso de obras de arte, su estado de conservación y ubicación.
3. **Biblioteca**: Catálogo de libros y gestión de préstamos para lectura en sala.
4. **Recursos Humanos (RRHH)**: Registro de trabajadores, generación de códigos QR y consolidación de firmas para aval de horas.
5. **Kiosko de Asistencia**: Interfaz de uso público/rápido para el control diario de entradas y salidas del personal.
6. **Recepción / Ingresos** (En desarrollo): Control de taquilla y registro de visitantes.
7. **Talleres y Auditorio**: Reservas de espacios, programación de eventos culturales e inscripción de alumnos.

## Tecnologías Utilizadas

- **Framework**: React 18 + Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: Arquitectura basada en componentes funcionales (Kiosko vs Admin Layout)
- **Tipografía**: Fuentes optimizadas (Inter, Playfair Display para toques institucionales)

## Ejecución del Proyecto

Para levantar el entorno de desarrollo local:

```bash
# 1. Instalar las dependencias
npm install

# 2. Iniciar el servidor en modo desarrollo
npm run dev
```

## Estructura del Código
- `src/pages/Mavet/`: Contiene todas las pantallas y la lógica de negocio central del museo.
- `src/services/api.ts`: Simula (Mock) la conexión con el backend mediante promesas con retardo.
- `src/types/index.ts`: Definición estricta de interfaces y tipos de datos (Obras, Libros, Trabajadores, etc.).
- `src/layout/AppSidebar.tsx`: Menú de navegación institucional.

> Proyecto personalizado para el MAVET. Se ha mantenido una base de componentes UI de la plantilla original para futuras extensiones (gráficos, tablas genéricas, alertas), pero el núcleo del sistema es completamente a la medida de la institución.
