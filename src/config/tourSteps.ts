
import type { DriveStep } from "driver.js";

export const globalTourSteps: DriveStep[] = [
  {
    element: "aside",
    popover: {
      title: "Menú lateral de navegación",
      description:
         "Menú principal del sistema. Aquí encuentra todos los módulos: Dashboard, Recepción, Auditorio, Talleres y más. Las opciones visibles dependen de su rol.",
      side: "right",
      align: "start",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/"]'),
    popover: {
      title: "Dashboard",
      description:
        "Panel principal con indicadores clave del museo adaptados a su rol.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/recepcion"]'),
    popover: {
      title: "Recepción MAVET",
      description:
        "Control de ingreso de visitantes: registro manual, QR, asistencia del personal, QR público y agenda diaria.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/auditorio"]'),
    popover: {
      title: "Auditorio y Espacios",
      description:
        "Gestión de reservas con calendario, creación de eventos, filtros, comprobante PDF y administración de salas.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/talleres"]'),
    popover: {
      title: "Talleres de Formación",
      description:
        "Planificación de talleres, inscripción de alumnos, inventario maestro, instructores y exportación PDF.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/asistencia"]'),
    popover: {
      title: "Asistencia del Personal",
      description:
        "Control de entrada/salida con cédula, PIN o QR. Registro diario y resumen semanal con justificaciones.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/biblioteca"]'),
    popover: {
      title: "Biblioteca",
      description:
        "Inventario de libros con préstamos en sala, filtros, búsqueda y exportación del catálogo a PDF.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/inventario-obras"]'),
    popover: {
      title: "Inventario de Bóveda",
      description:
        "Catálogo patrimonial de obras de arte con registro, artistas, filtros y exportación del inventario.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/rrhh"]'),
    popover: {
      title: "Recursos Humanos",
      description:
        "Registro de trabajadores con foto y PIN, carnets QR, usuarios del sistema con roles y credenciales.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('nav a[href="/auditoria"]'),
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
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Panel Principal",
      description:
        "Bienvenido al Dashboard. Esta es la vista principal con los indicadores del museo: tarjetas de resumen, lista de eventos, visitantes frecuentes, obras y libros recientes, y el gráfico de visitas.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="card-obras"]'),
    popover: {
      title: "Obras en Bóveda",
      description:
        "Total de piezas artísticas registradas en el inventario de la bóveda.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="card-titulos"]'),
    popover: {
      title: "Títulos en Biblioteca",
      description:
        "Total de libros disponibles en el catálogo de la biblioteca del museo.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="card-visitantes"]'),
    popover: {
      title: "Visitantes Registrados",
      description:
        "Acumulado histórico de ingresos registrados en el museo.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="card-eventos"]'),
    popover: {
      title: "Eventos Programados",
      description:
        "Número de actividades agendadas en el auditorio.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-flujo"]'),
    popover: {
      title: "Gráfico de visitantes",
      description:
        "Visualiza el flujo de visitantes día a día durante el mes actual. Se actualiza automáticamente.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-eventos"]'),
    popover: {
      title: "Próximos Eventos",
      description:
        "Actividades más cercanas programadas en el auditorio. Muestra fecha y hora.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-visitantes"]'),
    popover: {
      title: "Visitantes Frecuentes",
      description:
        "Ranking de los 3 visitantes que más han asistido al museo este mes.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-obras"]'),
    popover: {
      title: "Últimas Obras",
      description:
        "Obras ingresadas recientemente al inventario. Incluye código, título y estado de conservación.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-libros"]'),
    popover: {
      title: "Últimos Libros",
      description:
        "Libros registrados recientemente en la biblioteca. Incluye código, título y estado.",
      side: "top",
      align: "center",
    },
  },
];

export const auditorioTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Auditorio y Espacios",
      description: "Gestión de reservas, eventos, salas y comprobantes PDF.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="nueva-reserva"]'),
    popover: {
      title: "Nueva reserva",
      description: "Cree eventos con título, fecha, tipo, recursos y organizador.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="buscador-eventos"]'),
    popover: {
      title: "Buscador de eventos",
      description: "Busque eventos por título, organizador o código de reserva.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="filtro-tipo"]'),
    popover: {
      title: "Filtros",
      description: "Filtre por tipo y estado de aprobación.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="exportar-pdf"]'),
    popover: {
      title: "Exportar PDF",
      description: "Descargue el historial de eventos del auditorio.",
      side: "left",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="toggle-vista"]'),
    popover: {
      title: "Vista: Calendario / Lista",
      description: "Cambie entre vista de calendario mensual y lista de tarjetas.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="calendario-grid"]'),
    popover: {
      title: "Calendario de reservas",
      description: "Navegue entre meses y haga clic en eventos para ver o editar.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-salas"]'),
    popover: {
      title: "Gestión de salas",
      description: "Administre los espacios del museo: alta, edición y eliminación.",
      side: "top",
      align: "center",
    },
  },
];

export const recepcionTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Recepción",
      description:
        "Control de ingreso de visitantes. Busque personas, registre ingresos, genere QR público y administre menores acompañantes.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-qr"]'),
    popover: {
      title: "QR público",
      description:
        "Genere un código QR para que los visitantes se auto-registren desde su teléfono. El QR puede imprimirse.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-buscador"]'),
    popover: {
      title: "Buscador de personas",
      description:
        "Busque visitantes por cédula, nombre o teléfono. Si la persona ya existe, sus datos se cargan automáticamente.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-ingreso"]'),
    popover: {
      title: "Formulario de ingreso",
      description:
        "Complete nacionalidad, cédula, nombres, fecha de nacimiento, teléfono y motivo de visita. Marque 'Visita Institucional' si aplica. Acepte el consentimiento de privacidad para registrar.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-agenda"]'),
    popover: {
      title: "Agenda del día",
      description:
        "Eventos, talleres y actividades programadas para hoy.",
      side: "left",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-ingresos"]'),
    popover: {
      title: "Historial de ingresos",
      description:
        "Tabla con todos los ingresos registrados. Filtre por periodo, busque por nombre, y exporte a PDF.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-pdf"]'),
    popover: {
      title: "Exportar PDF",
      description:
        "Descargue un reporte de los ingresos filtrados.",
      side: "left",
      align: "center",
    },
  },
];

const talleresSharedSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Módulo de Talleres",
      description: "Gestión de actividades formativas: planificados, inscripciones, inventario e instructores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="stat-talleres"]'),
    popover: {
      title: "Indicadores",
      description: "Resumen de talleres activos, alumnos inscritos e inventario.",
      side: "bottom",
      align: "center",
    },
  },
];

const talleresStepsPorTab: Record<string, DriveStep[]> = {
  planificados: [
    {
      element: () => document.querySelector('[data-tour="buscador-planificados"]'),
      popover: {
        title: "Buscador y filtros",
        description: "Busque talleres por nombre o instructor. Active historial para ver ediciones anteriores.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: () => document.querySelector('[data-tour="planificar-taller"]'),
      popover: {
        title: "Planificar taller",
        description: "Cree una edición: seleccione taller, instructor, fechas y cupos.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="pdf-planificacion"]'),
      popover: {
        title: "Exportar planificación",
        description: "Descargue PDF con todos los talleres planificados.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="buscador-planificados"]'),
      popover: {
        title: "Lista de talleres",
        description: "Cada taller muestra nombre, instructor, fecha, cupos, estado y acciones.",
        side: "top",
        align: "center",
      },
    },
  ],
  inscripciones: [
    {
      element: () => document.querySelector('[data-tour="heading-inscripciones"]'),
      popover: {
        title: "Inscripciones por taller",
        description: "Acordeones por taller con alumnos inscritos. Expanda para ver detalle.",
        side: "top",
        align: "start",
      },
    },
    {
      element: () => document.querySelector('[data-tour="heading-inscripciones"]'),
      popover: {
        title: "Detalle de inscripciones",
        description: "Nombre, cédula, fecha y acciones por alumno. Busque y navegue con paginación.",
        side: "top",
        align: "start",
      },
    },
  ],
  inventario: [
    {
      element: () => document.querySelector('[data-tour="buscador-inventario"]'),
      popover: {
        title: "Inventario maestro",
        description: "Catálogo base de talleres. Busque por nombre o descripción.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: () => document.querySelector('[data-tour="heading-inventario-talleres"]'),
      popover: {
        title: "Tabla de inventario",
        description: "Lista de talleres base. Edite, elimine o cree nuevos.",
        side: "top",
        align: "center",
      },
    },
  ],
  instructores: [
    {
      element: () => document.querySelector('[data-tour="heading-instructores"]'),
      popover: {
        title: "Gestión de instructores",
        description: "Busque por cédula, complete datos y cree instructores.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: () => document.querySelector('[data-tour="btn-buscar-instructor"]'),
      popover: {
        title: "Buscar persona",
        description: "Ingrese cédula y presione Buscar para localizar al candidato.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="btn-crear-instructor"]'),
      popover: {
        title: "Crear instructor",
        description: "Complete profesión y especialidad, luego cree el instructor.",
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
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Inventario de Bóveda",
      description: "Catálogo patrimonial: obras, artistas, técnicas y categorías.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="agregar-nueva-obra"]'),
    popover: {
      title: "Registrar obra",
      description: "Ingrese código, título, artista, técnica, medidas y más.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-artistas"]'),
    popover: {
      title: "Gestión de artistas",
      description: "Cree fichas de artistas buscando primero por cédula.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="buscador-obras"]'),
    popover: {
      title: "Buscador y filtros",
      description: "Busque por código, título o autor. Use filtros avanzados.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="table-obras"]'),
    popover: {
      title: "Tabla de obras",
      description: "Inventario con código, título, autor, estado y más. Haga clic para ver ficha.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-artistas"]'),
    popover: {
      title: "Artistas registrados",
      description: "Tabla con nombres, documentos y acciones de edición.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="exportar-pdf"]'),
    popover: {
      title: "Exportar inventario",
      description: "Descargue PDF con todas las obras y datos técnicos.",
      side: "left",
      align: "center",
    },
  },
];

const bibliotecaSharedSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Biblioteca",
      description: "Inventario bibliográfico con préstamos en sala y devoluciones por cédula.",
      side: "bottom",
      align: "center",
    },
  },
];

const bibliotecaStepsPorTab: Record<string, DriveStep[]> = {
  inventario: [
    {
      element: () => document.querySelector('[data-tour="btn-registrar-libro"]'),
      popover: {
        title: "Registrar libro",
        description: "Agregue título: unidad, autor, estante, categoría, año y estado.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="btn-exportar-pdf"]'),
      popover: {
        title: "Exportar catálogo",
        description: "Descargue el catálogo completo en PDF.",
        side: "left",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="input-buscar-libro"]'),
      popover: {
        title: "Buscador de libros",
        description: "Busque por unidad, título o autor. Resultados en tiempo real.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="select-estado"]'),
      popover: {
        title: "Filtros de catálogo",
        description: "Filtre por estado, categoría y autor.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="table-libros"]'),
      popover: {
        title: "Catálogo de libros",
        description: "Tabla con unidad, título, autor, categoría, cantidad y estado.",
        side: "top",
        align: "center",
      },
    },
  ],
  consultas: [
    {
      element: () => document.querySelector('[data-tour="heading-consultas-cedula"]'),
      popover: {
        title: "Préstamos por cédula",
        description: "Historial de préstamos: activos, devueltos, fechas y acciones.",
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
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Recursos Humanos",
      description: "Gestión de personal: trabajadores con carnets QR y usuarios del sistema con roles.",
      side: "bottom",
      align: "center",
    },
  },
];

const rrhhStepsPorTab: Record<string, DriveStep[]> = {
  trabajadores: [
    {
      element: () => document.querySelector('[data-tour="rrhh-tabs"]'),
      popover: {
        title: "Pestaña Trabajadores",
        description: "Registre personal con foto, cargo, horario, PIN y carnet QR.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="registrar-trabajador"]'),
      popover: {
        title: "Registrar trabajador",
        description: "Complete datos del empleado y genere su carnet con QR y PIN.",
        side: "left",
        align: "center",
      },
    },
  ],
  usuarios: [
    {
      element: () => document.querySelector('[data-tour="rrhh-tabs"]'),
      popover: {
        title: "Pestaña Usuarios",
        description: "Gestione cuentas de acceso, roles y restablezca contraseñas.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: () => document.querySelector('[data-tour="crear-usuario"]'),
      popover: {
        title: "Crear usuario",
        description: "Vincule un trabajador, defina correo, contraseña y rol del sistema.",
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
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Asistencia",
      description: "Control de entrada/salida: registro diario y resumen semanal.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="tabs-asistencia"]'),
    popover: {
      title: "Registro Diario",
      description: "Marcaciones del día con filtros por cargo, estado y fecha.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="tabs-asistencia"]'),
    popover: {
      title: "Resumen Semanal",
      description: "Progreso circular con horas acumuladas y gestión de justificaciones.",
      side: "bottom",
      align: "center",
    },
  },
];

export const auditoriaTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Auditoría",
      description: "Registro detallado de acciones del sistema. Solo Administradores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="select-tipo-accion"]'),
    popover: {
      title: "Filtros",
      description: "Filtre por tipo de acción y rango de fechas.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-generar-reporte"]'),
    popover: {
      title: "Exportar reporte",
      description: "Descargue PDF con los registros filtrados.",
      side: "left",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="table-auditoria"]'),
    popover: {
      title: "Registro de actividad",
      description: "Fecha, usuario, acción con badge de color, detalle e IP.",
      side: "top",
      align: "center",
    },
  },
];

export const papeleraTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Papelera",
      description: "Restauración y eliminación definitiva de registros. Solo Administradores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-volver"]'),
    popover: {
      title: "Volver al Dashboard",
      description: "Regrese al panel principal.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="table-papelera"]'),
    popover: {
      title: "Registros eliminados",
      description: "Elementos organizados por tipo con fecha de eliminación.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-restaurar"]'),
    popover: {
      title: "Restaurar registro",
      description: "Recupere el elemento a su módulo de origen.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-vaciar"]'),
    popover: {
      title: "Eliminación definitiva",
      description: "Elimine permanentemente. Precaución: no se puede deshacer.",
      side: "bottom",
      align: "center",
    },
  },
];

export const profileTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Mi Perfil",
      description: "Información personal: foto, nombre, correo, teléfono y rol.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-info-personal"]'),
    popover: {
      title: "Tarjeta de identificación",
      description: "Foto, nombre, rol. Edite datos, cambie contraseña.",
      side: "bottom",
      align: "center",
    },
  },
];

export const ingresosTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Ingresos",
      description: "Dashboard de visitantes y reloj de trabajadores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="tabs-ingresos"]'),
    popover: {
      title: "Dashboard Visitantes",
      description: "Estadísticas: visitas del día, únicos, total histórico e ingresos por motivo.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="tabs-ingresos"]'),
    popover: {
      title: "Reloj de Trabajadores",
      description: "Marque entrada/salida con QR, cédula o PIN.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="stat-visitas-hoy"]'),
    popover: {
      title: "Estadísticas",
      description: "Visitas del día, únicos, total acumulado y más.",
      side: "bottom",
      align: "center",
    },
  },
];

export const educacionTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Educación",
      description: "Acceso a talleres, cursos y solicitudes de auditorio.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="tabs-educacion"]'),
    popover: {
      title: "Talleres y Cursos",
      description: "Planificación, inscripciones e instructores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="tabs-educacion"]'),
    popover: {
      title: "Solicitudes de Auditorio",
      description: "Calendario de reservas y eventos educativos.",
      side: "bottom",
      align: "center",
    },
  },
];

export const registroPublicoTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Registro de Visitante",
      description: "Auto-registro en pasos: cédula, datos personales y confirmación.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-identificate"]'),
    popover: {
      title: "Paso 1: Verificación",
      description: "Ingrese su cédula. Si ya existe, los datos se cargan automáticamente.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="heading-datos"]'),
    popover: {
      title: "Paso 2: Datos personales",
      description: "Complete nombres, teléfono, fecha de nacimiento y acompañantes.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="select-motivo"]'),
    popover: {
      title: "Paso 3: Motivo",
      description: "Seleccione motivo de visita y reciba su QR de confirmación.",
      side: "bottom",
      align: "center",
    },
  },
];

export const catalogosTourSteps: DriveStep[] = [
  {
    element: () => document.querySelector('[data-tour="page-heading"]'),
    popover: {
      title: "Catálogos del Sistema",
      description: "Gestión unificada de roles, cargos, categorías, técnicas y más.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="tabs-catalogos"]'),
    popover: {
      title: "Pestañas",
      description: "Navegue entre catálogos. Cada uno tiene búsqueda, creación y edición.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-nuevo"]'),
    popover: {
      title: "Nuevo registro",
      description: "Cree una entrada en el catálogo activo mediante formulario modal.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="input-buscar-catalogo"]'),
    popover: {
      title: "Buscador",
      description: "Filtre registros en tiempo real mientras escribe.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="table-catalogos"]'),
    popover: {
      title: "Tabla de registros",
      description: "Datos principales con botones Editar y Eliminar.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-editar"]'),
    popover: {
      title: "Editar registro",
      description: "Modifique datos del registro existente con formulario precargado.",
      side: "left",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[data-tour="btn-eliminar"]'),
    popover: {
      title: "Eliminar registro",
      description: "Elimine con confirmación. Algunos catálogos tienen datos referenciados.",
      side: "left",
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
  "/catalogos": catalogosTourSteps,
  "/profile": profileTourSteps,
  "/ingresos": ingresosTourSteps,
  "/educacion": educacionTourSteps,
  "/registro-visitante": registroPublicoTourSteps,
};
