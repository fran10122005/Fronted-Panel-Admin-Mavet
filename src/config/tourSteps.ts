
import type { DriveStep } from "driver.js";
import {
  findButtonByText,
  findButtonContainingText,
  findHeadingByText,
  findTable,
  findNthTable,
  findSelectByLabel,
  findSectionByHeading,
  findCardByLabel,
} from "./tourHelpers";

export const globalTourSteps: DriveStep[] = [
  {
    element: "aside",
    popover: {
      title: "Menú lateral de navegación",
      description:
        "Panel de navegación principal del sistema. Aquí encontrará acceso a todos los módulos del MAVET: Dashboard, Recepción, Auditorio, Talleres, Asistencia, Biblioteca, Inventario de Bóveda, Recursos Humanos y Auditoría. En la sección 'Otros' encontrará Manual de Usuario y Cerrar Sesión. Las opciones visibles dependen de su rol asignado.",
      side: "right",
      align: "start",
    },
  },
  {
    element: () => findButtonByText("Dashboard") || document.querySelector('a[href="/"]'),
    popover: {
      title: "Dashboard",
      description:
        "Página principal con indicadores clave del museo. Según su rol verá un tablero adaptado: Gerente/Admin (obras en bóveda, títulos en biblioteca, visitantes, eventos, gráficos), Recepcionista (visitantes, accesos rápidos), Bibliotecario (estado del catálogo), Educador (talleres y auditorio) o Curador (inventario de bóveda).",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Recepción") || document.querySelector('a[href="/recepcion"]'),
    popover: {
      title: "Recepción MAVET",
      description:
        "Control de ingreso de visitantes: registro manual con datos personales, escaneo de QR de auto-ingreso, asistencia del personal mediante cédula o QR, generación de QR público para imprimir, gestión de menores y agenda diaria de eventos.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Auditorio") || document.querySelector('a[href="/auditorio"]'),
    popover: {
      title: "Auditorio y Espacios",
      description:
        "Gestión de reservas del auditorio: calendario mensual con vista de lista, creación y edición de eventos con selección de recursos (sillas, mesas, sonido, proyector), filtros por tipo y estado, comprobante PDF, registro de asistentes y administración de salas del museo.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Talleres") || document.querySelector('a[href="/talleres"]'),
    popover: {
      title: "Talleres de Formación",
      description:
        "Gestión completa de talleres: planificación de nuevas ediciones, inscripción de alumnos con acordeones por taller, inventario maestro de talleres base, control de instructores con búsqueda por cédula y registro de sesiones. Incluye exportación a PDF y toggle de historial.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Asistencia") || document.querySelector('a[href="/asistencia"]'),
    popover: {
      title: "Asistencia del Personal",
      description:
        "Control de entrada y salida de trabajadores mediante cédula, PIN o QR del carnet institucional. Dos vistas: Registro Diario (tabla con filtros por cargo y estado) y Resumen Semanal (tarjetas con progreso circular de horas acumuladas vs. horas semanales y gestión de justificaciones).",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Biblioteca") || document.querySelector('a[href="/biblioteca"]'),
    popover: {
      title: "Biblioteca",
      description:
        "Inventario de libros con control de préstamos en sala: catálogo completo con filtros por estado, categoría y autor, búsqueda avanzada, registro y devolución de préstamos por cédula del solicitante. Incluye exportación del catálogo a PDF.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Inventario de Bóveda") ||
      findButtonContainingText("Bóveda") ||
      document.querySelector('a[href="/inventario-obras"]'),
    popover: {
      title: "Inventario de Bóveda",
      description:
        "Catálogo patrimonial de obras de arte: registro de obras con imagen, creación de artistas con búsqueda por cédula, técnicas y categorías personalizadas, filtros por clasificación patrimonial, ubicación y estado, ficha detallada con historial de cambios y exportación del inventario completo.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Recursos Humanos") ||
      findButtonContainingText("RRHH") ||
      document.querySelector('a[href="/rrhh"]'),
    popover: {
      title: "Recursos Humanos",
      description:
        "Gestión del personal: registro de trabajadores con foto, cargo, horas semanales personalizables y PIN; generación de carnets institucionales con código QR; creación de usuarios del sistema con asignación de roles (Administrador, Recepcionista, Bibliotecario, Curador, Educación) y control de credenciales.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Auditoría") || document.querySelector('a[href="/auditoria"]'),
    popover: {
      title: "Bitácora de Auditoría",
      description:
        "Registro detallado de todas las acciones del sistema: inicios y cierres de sesión, creación, actualización, eliminación, restauración y exportación de datos. Filtros por tipo de acción y rango de fechas, con exportación a PDF del reporte.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "header",
    popover: {
      title: "Barra superior",
      description:
        "Barra de herramientas global. Aquí encontrará: botón para colapsar/expandir el menú lateral, alternador de tema oscuro/claro, botón de Tutorial (?) para recorrer la página actual, acceso directo a la Papelera (solo Administradores) y menú de perfil de usuario con opción de cierre de sesión.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[aria-label="Toggle Sidebar"]'),
    popover: {
      title: "Colapsar menú lateral",
      description:
        "Oculte el menú lateral para tener más espacio de trabajo en pantalla. Vuelva a presionarlo para restaurar la navegación completa. En modo colapsado, pase el cursor sobre el menú para expandirlo temporalmente.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "header",
    popover: {
      title: "¡Tutorial completado!",
      description:
        "Ha recorrido los elementos principales del sistema. Use el botón de Tutorial (?) en la barra superior en cualquier momento para repetir el recorrido de la página actual. Explore cada módulo con confianza.",
      side: "bottom",
      align: "center",
    },
  },
];

export const dashboardTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Panel de"),
    popover: {
      title: "Panel Principal del MAVET",
      description:
        "Bienvenido al Dashboard. Esta vista se adapta según su rol en el sistema: administradores y gerentes ven el panel completo con todos los indicadores; recepcionistas ven estadísticas de visitas y accesos rápidos; bibliotecarios ven estado del catálogo; educadores ven resumen de talleres y auditorio; curadores ven inventario de bóveda.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findCardByLabel("Obras en Bóveda"),
    popover: {
      title: "Indicador: Obras en Bóveda",
      description:
        "Muestra el total de piezas artísticas registradas en el inventario de la bóveda. Disponible para roles Curador, Restaurador, Gerente y Administrador.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findCardByLabel("Títulos en Biblioteca"),
    popover: {
      title: "Indicador: Biblioteca",
      description:
        "Total de libros disponibles en el catálogo de la biblioteca del museo. Visible para Bibliotecarios, Gerentes y Administradores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findCardByLabel("Visitantes Registrados"),
    popover: {
      title: "Indicador: Visitantes",
      description:
        "Acumulado histórico de ingresos registrados en el museo. Disponible para Recepcionistas, Gerentes y Administradores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findCardByLabel("Eventos Programados"),
    popover: {
      title: "Indicador: Eventos",
      description:
        "Número de actividades agendadas en el auditorio. Visible para el rol de Educación, Gerentes y Administradores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Flujo de Visitantes"),
    popover: {
      title: "Gráfico de visitantes mensual",
      description:
        "Gráfico de área que visualiza el flujo de visitantes día a día durante el mes actual. Los datos se actualizan automáticamente con cada ingreso registrado en Recepción.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Próximos Eventos"),
    popover: {
      title: "Próximos Eventos",
      description:
        "Lista de las actividades más cercanas programadas en el auditorio. Cada tarjeta muestra fecha, hora y un enlace directo al módulo de Auditorio para ver detalles.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Visitantes Frecuentes"),
    popover: {
      title: "Top Visitantes Frecuentes",
      description:
        "Ranking de los 3 visitantes que más han asistido al museo durante el mes actual, con su total de visitas y última fecha de ingreso.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Últimas Obras Registradas"),
    popover: {
      title: "Últimas Obras",
      description:
        "Tabla con las obras ingresadas más recientemente al inventario de la bóveda. Incluye código de inventario, título y estado de conservación.",
      side: "top",
      align: "center",
    },
  },
];

export const auditorioTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Auditorio"),
    popover: {
      title: "Módulo de Auditorio y Espacios",
      description:
        "Panel de gestión de reservas del auditorio. Aquí podrá crear, editar y eliminar eventos, administrar los espacios físicos del museo y generar comprobantes PDF de las reservas.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="nueva-reserva"]') || findButtonContainingText("Nueva Reserva"),
    popover: {
      title: "Crear nueva reserva",
      description:
        "Abra el formulario para registrar una nueva actividad. Complete título, fecha, hora de inicio y fin, tipo de evento (Conferencia, Taller o Reunión) con opción 'Otro' personalizado. Seleccione los recursos necesarios (sillas, mesas, cortinas, sonido, proyector, micrófono). El organizador se busca por cédula con autocompletado de datos.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="buscador-eventos"]') ||
      document.querySelector('input[placeholder*="Buscar evento"]'),
    popover: {
      title: "Buscador de eventos",
      description:
        "Escriba aquí para localizar eventos por título, nombre del organizador o código de reserva. Los resultados se filtran en tiempo real.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="filtro-tipo"]') ||
      findSelectByLabel("Tipo"),
    popover: {
      title: "Filtros de búsqueda",
      description:
        "Filtre eventos por tipo (Conferencia, Taller o Reunión) y por estado de aprobación (Pendiente, Aprobado, Realizada). Cada tipo tiene un color distintivo en el calendario.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="exportar-pdf"]') ||
      findButtonContainingText("Exportar PDF"),
    popover: {
      title: "Exportar historial",
      description:
        "Descargue un reporte en PDF con el historial completo de eventos del auditorio.",
      side: "left",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[class*="Month"]') ||
      findButtonContainingText("Mes"),
    popover: {
      title: "Vista: Calendario / Lista",
      description:
        "Cambie entre la vista de calendario mensual y la vista de lista de tarjetas. La vista calendario es ideal para visualizar la ocupación por día. En la vista lista cada tarjeta muestra tipo, estado, organizador y acciones disponibles.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[class*="CalendarGrid"]') ||
      document.querySelector('[class*="grid"]'),
    popover: {
      title: "Calendario de reservas",
      description:
        "Navegue entre meses con las flechas izquierda/derecha o presione 'Hoy' para volver al mes actual. Cada evento se muestra como una burbuja de color: brand para Conferencias, verde para Talleres y naranja para Reuniones. Haga clic en un evento para ver o editar sus datos, generar comprobante o registrar asistentes.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Gestión de Salas"),
    popover: {
      title: "Gestión de espacios del museo",
      description:
        "Administre los espacios físicos del museo: agregue nuevas salas con nombre, código y capacidad. También puede editar o eliminar espacios existentes desde la tabla de gestión.",
      side: "top",
      align: "center",
    },
  },
];

export const recepcionTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Recepción"),
    popover: {
      title: "Módulo de Recepción",
      description:
        "Panel principal de control de ingresos del museo. Desde aquí se gestionan las entradas de visitantes, la asistencia del personal, el registro de menores y el acceso mediante QR público.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Asistencia Personal"),
    popover: {
      title: "Asistencia del personal",
      description:
        "Registre la entrada o salida de trabajadores del museo. Puede escanear el código QR del carnet institucional, ingresar la cédula manualmente o usar el teclado PIN.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Generar QR"),
    popover: {
      title: "QR público de auto-ingreso",
      description:
        "Genere un código QR para que los visitantes puedan auto-registrarse desde su teléfono móvil sin necesidad de pasar por taquilla. El QR puede imprimirse desde el modal.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Buscador Global"),
    popover: {
      title: "Buscador de personas",
      description:
        "Busque visitantes por cédula, nombre o teléfono. Escriba al menos 3 caracteres para activar la búsqueda automática. Si la persona ya existe, sus datos se cargarán automáticamente en el formulario de ingreso.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('input[placeholder*="Cédula"]') ||
      document.querySelector('input[placeholder*="Ej."]'),
    popover: {
      title: "Formulario de ingreso",
      description:
        "Complete los datos del visitante: seleccione nacionalidad (V- o E-), ingrese cédula, nombres, apellidos, fecha de nacimiento, teléfono y seleccione el motivo de la visita. Marque 'Visita Institucional' si aplica, indique la cantidad de acompañantes y acepte el consentimiento de privacidad. Para menores de edad, use el botón 'Registrar Menor'.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Agenda de Hoy"),
    popover: {
      title: "Agenda del día",
      description:
        "Lista de eventos, talleres y actividades programadas para la fecha actual. Incluye reservas de auditorio y actividades formativas.",
      side: "left",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Ingresos Registrados"),
    popover: {
      title: "Historial de ingresos",
      description:
        "Tabla con todos los ingresos registrados. Use los filtros Hoy, Este Mes o Este Año, busque por cédula o nombre, filtre por rango de fechas y por motivo. Puede exportar los datos a PDF y navegar con paginación.",
      side: "top",
      align: "center",
    },
  },
];

const talleresSharedSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Gestión de Talleres"),
    popover: {
      title: "Módulo de Talleres",
      description:
        "Panel integral para la gestión de actividades formativas del museo. Cuatro secciones principales: Planificados (ediciones activas e históricas), Inscripciones (alumnos por taller), Inventario (talleres base) e Instructores (registro y gestión).",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findSectionByHeading("Talleres Activos"),
    popover: {
      title: "Indicadores",
      description:
        "Resumen rápido: talleres activos actualmente, total de alumnos inscritos y cantidad de talleres disponibles en el inventario maestro.",
      side: "bottom",
      align: "center",
    },
  },
];

const talleresStepsPorTab: Record<string, DriveStep[]> = {
  planificados: [
    {
      element: () => document.querySelector('[data-tour="buscador-planificados"]') || findHeadingByText("Listado de Talleres"),
      popover: {
        title: "Buscador y filtros",
        description:
          "Busque talleres por nombre del curso o instructor. Use el filtro desplegable para ver solo los talleres de un instructor específico. Active 'Mostrar Historial' para ver ediciones anteriores.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: () => document.querySelector('[data-tour="planificar-taller"]') || findButtonContainingText("Planificar Taller"),
      popover: {
        title: "Planificar nuevo taller",
        description:
          "Cree una nueva edición de taller: seleccione un taller del inventario, asigne instructor, espacio físico, fechas, horarios y defina los cupos mínimos y máximos disponibles.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="pdf-planificacion"]') || findButtonContainingText("PDF Planificación"),
      popover: {
        title: "Exportar planificación",
        description:
          "Descargue un PDF con todos los talleres planificados actualmente.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => findHeadingByText("Listado de Talleres"),
      popover: {
        title: "Lista de talleres planificados",
        description:
          "Cada taller muestra nombre, instructor, fecha, cupos y estado. Use los botones en cada fila: [Asistencia] para pasar lista, [PDF] para la ficha, [+] para inscribir alumnos, [Sesiones] para ver detalle de encuentros, [Editar] y [Eliminar]. Haga clic en el nombre para ver la ficha completa del taller.",
        side: "top",
        align: "center",
      },
    },
  ],
  inscripciones: [
    {
      element: () => findHeadingByText("Alumnos Inscritos"),
      popover: {
        title: "Inscripciones por taller",
        description:
          "Acordeones agrupados por taller. Cada uno muestra el número de alumnos inscritos. Haga clic para expandir y ver la lista detallada. Use 'Mostrar Historial' para ver inscripciones de ediciones anteriores.",
        side: "top",
        align: "start",
      },
    },
    {
      element: () => document.querySelector("details") || findHeadingByText("Alumnos Inscritos"),
      popover: {
        title: "Detalle de inscripciones",
        description:
          "Al expandir un taller, verá el nombre del alumno, cédula, fecha de inscripción y estado. Use el icono [Eliminar] para desinscribir. Busque alumnos por nombre o cédula y navegue con paginación.",
        side: "top",
        align: "start",
      },
    },
  ],
  inventario: [
    {
      element: () => document.querySelector('[data-tour="buscador-inventario"]') || findHeadingByText("Inventario de Talleres"),
      popover: {
        title: "Inventario maestro",
        description:
          "Catálogo base de talleres del museo. Busque por nombre o descripción en el campo de texto. Puede exportar el inventario a PDF.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: () => findHeadingByText("Inventario de Talleres"),
      popover: {
        title: "Tabla de inventario",
        description:
          "Lista todos los talleres base con nombre y descripción. Use [Editar] para modificar o [Eliminar] para eliminar. Solo los administradores pueden eliminar. Desde aquí también puede crear un nuevo taller base.",
        side: "top",
        align: "center",
      },
    },
  ],
  instructores: [
    {
      element: () => findHeadingByText("Gestionar Instructores"),
      popover: {
        title: "Gestión de instructores",
        description:
          "Panel completo de instructores. Busque una persona por cédula, complete profesión y especialidad, y créela como instructor. Filtre la tabla por profesión o especialidad.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: () => findButtonContainingText("Buscar"),
      popover: {
        title: "Buscar persona",
        description:
          "Ingrese una cédula (Ej: V-12345678) y presione Buscar. Si la persona existe y no es instructor, aparecerá una tarjeta verde para continuar con el registro.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => findButtonContainingText("Crear Instructor"),
      popover: {
        title: "Crear instructor",
        description:
          "Complete profesión y especialidad, luego presione Crear Instructor. El nuevo instructor aparecerá en la tabla inferior y estará disponible al planificar talleres.",
        side: "top",
        align: "center",
      },
    },
  ],
};

export const talleresTourSteps: DriveStep[] = [
  ...talleresSharedSteps,
  ...talleresStepsPorTab.planificados,
  ...talleresStepsPorTab.inscripciones,
  ...talleresStepsPorTab.inventario,
  ...talleresStepsPorTab.instructores,
];

export function getTalleresTourSteps(tabId: string): DriveStep[] {
  const steps = talleresStepsPorTab[tabId];
  if (!steps) return talleresTourSteps;
  return [...talleresSharedSteps, ...steps];
}

export const bovedaTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Inventario de Bóveda"),
    popover: {
      title: "Inventario de Bóveda",
      description:
        "Catálogo digital del patrimonio artístico del museo. Gestione obras de arte, artistas y todos los datos técnicos asociados a cada pieza. Incluye creación de técnicas y categorías personalizadas.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="agregar-nueva-obra"]') ||
      findButtonContainingText("Agregar Nueva Obra"),
    popover: {
      title: "Registrar nueva obra",
      description:
        "Ingrese una nueva pieza al inventario: código de inventario, título, artista (seleccionable del catálogo), técnica con opción 'Otro (especificar)' para crear una nueva sobre la marcha, año, medidas, categoría también personalizable, ubicación, estado de conservación, clasificación patrimonial e imagen de la obra.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="agregar-artista"]') ||
      findButtonContainingText("Agregar Artista"),
    popover: {
      title: "Gestión de artistas",
      description:
        "Cree fichas de artistas para asociarlos a las obras. Busque primero por cédula para evitar registrar duplicados en el catálogo. Complete nombre, apellido, nacionalidad y fecha de nacimiento.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="buscador-obras"]') ||
      document.querySelector('input[placeholder="Buscar por código, título o autor..."]'),
    popover: {
      title: "Buscador y filtros",
      description:
        "Busque obras por código de inventario, título o autor. Use los filtros avanzados: categoría, autor, ubicación, estado de conservación, clasificación patrimonial y ordenamiento por columna.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findTable(),
    popover: {
      title: "Tabla de obras",
      description:
        "Inventario completo con código, título, autor, técnica, categoría, dimensiones, ubicación y estado de cada obra. Los estados tienen badges de color: Excelente, Bueno, Regular, Malo o Restauración. Haga clic en cualquier fila para ver la ficha completa con historial de cambios.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Artistas"),
    popover: {
      title: "Artistas registrados",
      description:
        "Sección de artistas con tabla de nombres, documentos de identidad y acciones de edición o eliminación. Aquí puede gestionar el catálogo completo de autores.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="exportar-pdf"]') ||
      findButtonContainingText("Exportar PDF"),
    popover: {
      title: "Exportar inventario",
      description:
        "Descargue un PDF completo con todas las obras del inventario, incluyendo datos técnicos y de catalogación.",
      side: "left",
      align: "center",
    },
  },
];

const bibliotecaSharedSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Biblioteca"),
    popover: {
      title: "Módulo de Biblioteca",
      description:
        "Gestión del inventario bibliográfico del museo. Dos secciones: Inventario (catálogo de libros con registro, edición y filtros) y Consultas/Préstamos (control de préstamos en sala y devoluciones por cédula del solicitante).",
      side: "bottom",
      align: "center",
    },
  },
];

const bibliotecaStepsPorTab: Record<string, DriveStep[]> = {
  inventario: [
    {
      element: () => findButtonContainingText("Registrar Nuevo Libro"),
      popover: {
        title: "Registrar nuevo libro",
        description:
          "Agregue un nuevo título al catálogo: unidad, título, autor, estante, categoría, año, cantidad total, estado y observaciones.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => findButtonContainingText("Exportar PDF"),
      popover: {
        title: "Exportar catálogo",
        description:
          "Descargue el catálogo completo de la biblioteca en formato PDF.",
        side: "left",
        align: "center",
      },
    },
    {
      element: () =>
        document.querySelector('input[placeholder*="Buscar por unidad"]') ||
        document.querySelector('input[placeholder*="buscar"]'),
      popover: {
        title: "Buscador de libros",
        description:
          "Busque libros por unidad, título o autor dentro del catálogo. Resultados en tiempo real. Puede ordenar la tabla haciendo clic en los encabezados de columna.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => findSelectByLabel("Estado"),
      popover: {
        title: "Filtros de catálogo",
        description:
          "Filtre los libros por estado (disponible, prestado), categoría y autor. Use los filtros en conjunto con el buscador para encontrar rápidamente lo que necesita.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => findNthTable(0),
      popover: {
        title: "Catálogo de libros",
        description:
          "Tabla del inventario con unidad, título, autor, estante, categoría, cantidad disponible y total, y estado actual del ejemplar. Haga clic en una fila para ver el detalle completo del libro.",
        side: "top",
        align: "center",
      },
    },
  ],
  consultas: [
    {
      element: () => findHeadingByText("Control de Préstamos"),
      popover: {
        title: "Préstamos por cédula",
        description:
          "Busque por cédula del solicitante para ver el historial completo de préstamos: libros activos, devueltos, fechas y estados. Use [Devolver] para registrar la devolución de un libro activo y [Ver detalle] para consultar la información del préstamo.",
        side: "top",
        align: "center",
      },
    },
  ],
};

export const bibliotecaTourSteps: DriveStep[] = [
  ...bibliotecaSharedSteps,
  ...bibliotecaStepsPorTab.inventario,
  ...bibliotecaStepsPorTab.consultas,
];

export function getBibliotecaTourSteps(tabId: string): DriveStep[] {
  const steps = bibliotecaStepsPorTab[tabId];
  if (!steps) return bibliotecaTourSteps;
  return [...bibliotecaSharedSteps, ...steps];
}

const rrhhSharedSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Gestión de RRHH"),
    popover: {
      title: "Módulo de Recursos Humanos",
      description:
        "Gestión integral del personal del museo y usuarios del sistema. Dos secciones principales: Trabajadores (registro, carnets con QR, horarios personalizables) y Usuarios (cuentas de acceso al sistema con asignación de roles).",
      side: "bottom",
      align: "center",
    },
  },
];

const rrhhStepsPorTab: Record<string, DriveStep[]> = {
  trabajadores: [
    {
      element: () =>
        findButtonByText("Trabajadores") ||
        findButtonContainingText("Trabajadores"),
      popover: {
        title: "Pestaña: Trabajadores",
        description:
          "Registre y administre el personal del museo. Cada trabajador puede tener foto, cargo, horario semanal con horas personalizables (tiempo completo o parcial), PIN de acceso y un carnet institucional con código QR para control de asistencia.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="registrar-trabajador"]') ||
        findButtonContainingText("Registrar Trabajador"),
      popover: {
        title: "Registrar nuevo trabajador",
        description:
          "Complete los datos del empleado: nombres, apellidos, cédula, fecha de nacimiento, teléfono, correo, cargo, tipo de horario (tiempo completo o parcial), horas semanales personalizables y estado. Una vez registrado, podrá generar su carnet institucional con código QR y PIN de acceso.",
        side: "left",
        align: "center",
      },
    },
  ],
  usuarios: [
    {
      element: () =>
        findButtonByText("Usuarios") || findButtonContainingText("Usuarios"),
      popover: {
        title: "Pestaña: Usuarios del sistema",
        description:
          "Gestione las cuentas de acceso al panel administrativo. Cree usuarios vinculados a trabajadores, asigne roles (Administrador, Recepcionista, Bibliotecario, Curador, Educación) y restablezca contraseñas cuando sea necesario. Puede suspender o activar cuentas según sea necesario.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="crear-usuario"]') ||
        findButtonContainingText("Crear Usuario"),
      popover: {
        title: "Crear usuario del sistema",
        description:
          "Cree una nueva cuenta de acceso vinculando un trabajador existente. Defina el correo electrónico, contraseña inicial y el rol del sistema que determinará los módulos a los que tendrá acceso. También puede restablecer la contraseña o cambiar el estado (Activo/Suspendido) desde las acciones de la tabla.",
        side: "left",
        align: "center",
      },
    },
  ],
};

export const rrhhTourSteps: DriveStep[] = [
  ...rrhhSharedSteps,
  ...rrhhStepsPorTab.trabajadores,
  ...rrhhStepsPorTab.usuarios,
];

export function getRRHHTourSteps(tabId: string): DriveStep[] {
  const steps = rrhhStepsPorTab[tabId];
  if (!steps) return rrhhTourSteps;
  return [...rrhhSharedSteps, ...steps];
}

export const asistenciaTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Registro de Asistencia Personal"),
    popover: {
      title: "Módulo de Asistencia",
      description:
        "Control de entrada y salida de trabajadores del museo. Dos vistas: Registro Diario (tabla detallada con filtros) y Resumen Semanal (panel de cumplimiento por trabajador).",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Registro Diario") || findButtonContainingText("Diario"),
    popover: {
      title: "Pestaña: Registro Diario",
      description:
        "Tabla con todas las marcaciones del día: hora, trabajador, cédula, cargo, entrada, salida y observaciones. Filtre por cargo, estado (con entrada, con salida, completo, incompleto) o seleccione una fecha específica. Use [Observaciones] para añadir notas y [Justificar] para registrar justificaciones de inasistencia.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Resumen Semanal") || findButtonContainingText("Semanal"),
    popover: {
      title: "Pestaña: Resumen Semanal",
      description:
        "Cuadrícula de tarjetas con el resumen de cada trabajador: progreso circular con horas acumuladas vs. horas semanales configuradas, estado (Completo, Justificado o Incompleto), horas restantes y observaciones. Use [Gestionar Justificaciones] para administrar inasistencias.",
      side: "bottom",
      align: "center",
    },
  },
];

export const auditoriaTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Bitácora de Auditoría"),
    popover: {
      title: "Módulo de Auditoría",
      description:
        "Registro detallado de todas las acciones realizadas en el sistema para fines de supervisión y control. Solo accesible para Administradores y Gerentes.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="filtro-tipo"]') ||
      findSelectByLabel("Tipo de Acción"),
    popover: {
      title: "Filtros de búsqueda",
      description:
        "Filtre los registros por tipo de acción: Inicio de sesión, Cierre de sesión, Creación, Actualización, Eliminación, Restauración o Exportación. También puede filtrar por rango de fechas usando los campos Desde y Hasta.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonContainingText("Generar Reporte"),
    popover: {
      title: "Exportar reporte",
      description:
        "Descargue un reporte en PDF con los registros de auditoría filtrados.",
      side: "left",
      align: "center",
    },
  },
  {
    element: () => findTable(),
    popover: {
      title: "Registro de actividad",
      description:
        "Tabla con fecha y hora, usuario, tipo de acción (con badge de color), detalle descriptivo y dirección IP. Los tipos están codificados por color: azul para login, gris para logout, rojo para eliminación, verde para creación y amarillo para demás acciones. Navegue entre páginas con los botones Anterior/Siguiente.",
      side: "top",
      align: "center",
    },
  },
];

export const papeleraTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Papelera de Reciclaje"),
    popover: {
      title: "Papelera de reciclaje",
      description:
        "Gestión de registros eliminados del sistema. Aquí puede restaurar elementos a su módulo de origen o eliminarlos definitivamente. Solo accesible para Administradores. Puede filtrar por tipo de elemento (Obra, Libro, Trabajador, Taller, Artista, Espacio, Usuario, etc.) y buscar por texto.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('a[href="/"]') || findButtonContainingText("Volver"),
    popover: {
      title: "Volver al Dashboard",
      description:
        "Regrese al panel principal sin afectar los registros de la papelera.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findTable(),
    popover: {
      title: "Registros eliminados",
      description:
        "Lista de elementos eliminados organizados por tipo, con título, detalles y fecha de eliminación. Use la paginación para navegar entre resultados.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Restaurar"),
    popover: {
      title: "Restaurar registro",
      description:
        "Devuelva el elemento eliminado a su módulo de origen con todos sus datos intactos. Use esta opción para recuperar información eliminada por error.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Eliminar permanentemente"),
    popover: {
      title: "Eliminación definitiva",
      description:
        "Elimine el registro de forma permanente. Precaución: esta acción no se puede deshacer. También dispone del botón 'Vaciar Papelera' para limpiar todos los registros de una sola vez. Solo debe usarse con autorización explícita.",
      side: "bottom",
      align: "center",
    },
  },
];

export const profileTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Mi Perfil"),
    popover: {
      title: "Perfil de Usuario",
      description:
        "Información de su cuenta personal. Aquí puede ver y actualizar sus datos de perfil incluyendo foto, nombre, correo electrónico, teléfono y rol asignado en el sistema.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[class*="UserMetaCard"]') ||
      document.querySelector('[class*="rounded-2xl"]'),
    popover: {
      title: "Tarjeta de identificación",
      description:
        "Foto de perfil, nombre completo y rol. Desde aquí puede actualizar su foto, cambiar su contraseña y editar sus datos personales como correo electrónico, teléfono y dirección.",
      side: "bottom",
      align: "center",
    },
  },
];

export const ingresosTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Registro de Ingresos"),
    popover: {
      title: "Módulo de Ingresos",
      description:
        "Panel de control de visitas al museo y registro horario del personal. Dos vistas principales: Dashboard de Visitantes (estadísticas y métricas) y Reloj de Trabajadores (marcación de entrada y salida).",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Dashboard Visitantes") ||
      findButtonContainingText("Dashboard"),
    popover: {
      title: "Pestaña: Dashboard Visitantes",
      description:
        "Vista resumen con estadísticas de visitas: visitas del día, visitantes únicos registrados, total histórico acumulado y tabla de ingresos por motivo.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Reloj de Trabajadores") ||
      findButtonContainingText("Reloj"),
    popover: {
      title: "Pestaña: Reloj de Trabajadores",
      description:
        "Registro de entrada y salida del personal del museo. Permite escanear el código QR del carnet, ingresar la cédula o usar el teclado PIN para marcar asistencia.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Visitas de Hoy"),
    popover: {
      title: "Estadísticas de visitas",
      description:
        "Tarjetas con indicadores clave: visitas del día, visitantes únicos registrados, total acumulado histórico y otras métricas de ingreso.",
      side: "bottom",
      align: "center",
    },
  },
];

export const educacionTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Módulo de Educación"),
    popover: {
      title: "Módulo de Educación",
      description:
        "Portal integrado de gestión educativa del museo. Acceso rápido a Talleres y Cursos (planificación, inscripciones e instructores) y a las Solicitudes de Auditorio (reservas, calendario y salas) desde una sola pantalla.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Talleres y Cursos") ||
      findButtonContainingText("Talleres"),
    popover: {
      title: "Pestaña: Talleres y Cursos",
      description:
        "Gestión de actividades formativas del museo: talleres activos, planificación de nuevas ediciones, inscripción de alumnos y control de instructores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Solicitudes de Auditorio") ||
      findButtonContainingText("Auditorio"),
    popover: {
      title: "Pestaña: Solicitudes de Auditorio",
      description:
        "Administración de solicitudes de uso del auditorio para actividades educativas. Calendario de reservas, creación y seguimiento de eventos, con generación de comprobantes PDF.",
      side: "bottom",
      align: "center",
    },
  },
];

export const registroPublicoTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]') || findHeadingByText("Registro de Visitante"),
    popover: {
      title: "Registro Público de Visitantes",
      description:
        "Formulario de auto-registro para visitantes del museo. Proceso en varios pasos: verificación de cédula, datos personales y confirmación con código QR. No requiere iniciar sesión.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('input[placeholder*="Cédula"]') ||
      document.querySelector('input[name="cedula"]'),
    popover: {
      title: "Paso 1: Verificación de cédula",
      description:
        "Ingrese su número de cédula para verificar si ya está registrado en el sistema. Si ya existe, sus datos se cargarán automáticamente. Si es nuevo, continúe al siguiente paso.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('input[placeholder*="Nombre"]') ||
      document.querySelector('input[name="nombres"]'),
    popover: {
      title: "Paso 2: Datos personales",
      description:
        "Complete sus datos: nombres, apellidos, teléfono, fecha de nacimiento y cantidad de acompañantes. Si es una visita institucional, marque la casilla correspondiente. Acepte el consentimiento de privacidad para continuar.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('select[id*="motivo"]') ||
      document.querySelector('select[name*="motivo"]'),
    popover: {
      title: "Paso 3: Motivo y confirmación",
      description:
        "Seleccione el motivo de su visita: visita general, investigación, eventos culturales, taller o exposición. Si selecciona 'Otro', especifique el motivo. Al finalizar recibirá un código QR de confirmación que podrá mostrar en recepción.",
      side: "bottom",
      align: "center",
    },
  },
];

export const pageTourSteps: Record<string, DriveStep[]> = {
  "/": dashboardTourSteps,
  "/auditorio": auditorioTourSteps,
  "/recepcion": recepcionTourSteps,
  "/talleres": talleresTourSteps,
  "/inventario-obras": bovedaTourSteps,
  "/biblioteca": bibliotecaTourSteps,
  "/rrhh": rrhhTourSteps,
  "/asistencia": asistenciaTourSteps,
  "/auditoria": auditoriaTourSteps,
  "/papelera": papeleraTourSteps,
  "/profile": profileTourSteps,
  "/ingresos": ingresosTourSteps,
  "/educacion": educacionTourSteps,
  "/registro-visitante": registroPublicoTourSteps,
};
