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
        "Panel de navegación principal del sistema. Aquí encontrará acceso a todos los módulos del MAVET: Dashboard, Auditorio, Recepción, Talleres, Bóveda, Biblioteca y Recursos Humanos. Las opciones visibles dependen de su rol asignado.",
      side: "right",
      align: "start",
    },
  },
  {
    element: () => findButtonByText("Dashboard") || document.querySelector('a[href="/"]'),
    popover: {
      title: "Dashboard",
      description:
        "Página principal con indicadores clave del museo: obras en bóveda, títulos en biblioteca, visitantes registrados y eventos programados. Incluye gráfico de flujo de visitantes y widgets de información.",
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
        "Gestión de reservas del auditorio: calendario mensual, creación y edición de eventos, filtros por tipo, exportación de PDF y administración de salas del museo.",
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
        "Control de ingreso de visitantes: registro manual, escaneo QR, asistencia del personal, generación de QR público y agenda diaria de eventos.",
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
        "Gestión completa de talleres: inventario de talleres, planificación, inscripción de alumnos, control de instructores y registro de sesiones.",
      side: "right",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Bóveda") ||
      findButtonContainingText("Inventario") ||
      document.querySelector('a[href="/inventario-obras"]'),
    popover: {
      title: "Inventario de Bóveda",
      description:
        "Catálogo patrimonial de obras de arte: registro de obras con imágenes, gestión de artistas, filtros por estado y exportación del inventario completo.",
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
        "Inventario de libros con control de préstamos en sala: catálogo completo, búsqueda avanzada, filtros y gestión de devoluciones.",
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
        "Gestión del personal: registro de trabajadores, generación de carnets con QR, creación de usuarios del sistema, asignación de roles y control de asistencias.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "header",
    popover: {
      title: "Barra superior",
      description:
        "Barra de herramientas global. Aquí encontrará: botón para colapsar/expandir el menú lateral, alternador de tema oscuro/claro, acceso directo a la papelera (solo Administradores y Gerentes) y menú de perfil de usuario con opción de cierre de sesión.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => document.querySelector('[aria-label="Toggle Sidebar"]'),
    popover: {
      title: "Colapsar menú lateral",
      description:
        "Oculte el menú lateral para tener más espacio de trabajo en pantalla. Vuelva a presionarlo para restaurar la navegación completa.",
      side: "bottom",
      align: "center",
    },
  },
];

export const dashboardTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Panel Principal"),
    popover: {
      title: "Panel Principal del MAVET",
      description:
        "Bienvenido al Dashboard. Esta es la vista ejecutiva del sistema, diseñada para ofrecer un resumen rápido del estado operativo del museo.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findCardByLabel("Obras en Bóveda"),
    popover: {
      title: "Indicador: Obras en Bóveda",
      description:
        "Muestra el total de piezas artísticas registradas en el inventario de la bóveda. Disponible para roles Curador y Administrador.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findCardByLabel("Títulos en Biblioteca"),
    popover: {
      title: "Indicador: Biblioteca",
      description:
        "Total de libros disponibles en el catálogo de la biblioteca del museo. Visible para Bibliotecarios y Administradores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findCardByLabel("Visitantes Registrados"),
    popover: {
      title: "Indicador: Visitantes",
      description:
        "Acumulado histórico de ingresos registrados en el museo. Disponible para Recepcionistas y Administradores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findCardByLabel("Eventos Programados"),
    popover: {
      title: "Indicador: Eventos",
      description:
        "Número de actividades agendadas en el auditorio. Visible para el rol de Educación y Administradores.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Flujo de Visitantes"),
    popover: {
      title: "Gráfico de visitantes mensual",
      description:
        "Gráfico de área que visualiza el flujo de visitantes día a día durante el mes actual. Los datos se actualizan automáticamente con cada ingreso registrado.",
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
    element: () => findHeadingByText("Auditorio"),
    popover: {
      title: "Módulo de Auditorio y Espacios",
      description:
        "Panel de gestión de reservas del auditorio. Aquí podrá crear, editar y eliminar eventos, así como administrar los espacios físicos del museo.",
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
        "Abra el formulario para registrar una nueva actividad en el calendario. Complete el título, fecha, hora de inicio y fin, tipo de evento y busque al organizador por cédula.",
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
      title: "Filtro por tipo de evento",
      description:
        "Seleccione el tipo de evento para filtrar: Conferencia, Taller o Reunión. Cada tipo tiene un color distintivo en el calendario.",
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
        "Cambie entre la vista de calendario mensual y la vista de lista de tarjetas. La vista calendario es ideal para visualizar la ocupación por día.",
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
        "Navegue entre meses usando las flechas izquierda/derecha o presione 'Hoy' para volver al mes actual. Cada evento se muestra como una burbuja de color: brand para Conferencias, verde para Talleres y naranja para Reuniones. Haga clic en un evento para ver o editar sus datos.",
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
    element: () => findHeadingByText("Recepción"),
    popover: {
      title: "Módulo de Recepción",
      description:
        "Panel principal de control de ingresos del museo. Desde aquí se gestionan las entradas de visitantes, la asistencia del personal y el acceso mediante QR.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Asistencia Personal"),
    popover: {
      title: "Asistencia del personal",
      description:
        "Registre la entrada o salida de trabajadores del museo. Puede escanear el código QR del carnet institucional o ingresar la cédula manualmente.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Generar QR"),
    popover: {
      title: "QR público de auto-ingreso",
      description:
        "Genere un código QR para que los visitantes puedan auto-registrarse desde su teléfono móvil sin necesidad de pasar por taquilla. El QR puede imprimirse.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Buscador Global"),
    popover: {
      title: "Buscador de personas",
      description:
        "Busque visitantes por cédula, nombre o teléfono. Escriba al menos 3 caracteres para activar la búsqueda automática. Si la persona ya existe en la base de datos, sus datos se cargarán automáticamente.",
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
        "Complete los datos del visitante: seleccione nacionalidad (V- o E-), ingrese cédula, nombres, apellidos, fecha de nacimiento, teléfono y seleccione el motivo de la visita. Para visitas institucionales, marque la casilla correspondiente.",
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
        "Tabla con todos los ingresos registrados. Use los filtros Hoy, Este Mes o Este Año para cambiar el período de visualización. Puede exportar los datos a PDF.",
      side: "top",
      align: "center",
    },
  },
];

export const talleresTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Gestión de Talleres"),
    popover: {
      title: "Módulo de Talleres",
      description:
        "Panel integral para la gestión de actividades formativas del museo: inventario de talleres, planificación, inscripciones y control de instructores.",
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
  {
    element: () => findButtonContainingText("Gestionar Instructores"),
    popover: {
      title: "Gestión de instructores",
      description:
        "Registre, consulte y administre los facilitadores disponibles. Busque por nombre o cédula para evitar duplicados antes de crear uno nuevo.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Planificar Taller"),
    popover: {
      title: "Planificar nuevo taller",
      description:
        "Cree una nueva edición de taller: seleccione un taller del inventario, asigne instructor, espacio físico, fecha y defina la cantidad de cupos disponibles.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Listado de Talleres"),
    popover: {
      title: "Talleres planificados",
      description:
        "Lista de talleres activos con nombre, instructor, fecha, cupos disponibles y estado. Use el menú contextual en cada fila para acciones rápidas: Recepción, Asistencia, Inscribir, Editar o Eliminar.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Alumnos Inscritos"),
    popover: {
      title: "Alumnos inscritos por taller",
      description:
        "Acordeones expandibles que muestran los alumnos inscritos en cada taller con nombre, cédula, fecha de inscripción y estado. Puede desinscribir alumnos si es necesario.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Inventario de Talleres"),
    popover: {
      title: "Inventario maestro",
      description:
        "Catálogo base de todos los talleres que ofrece el museo. Aquí se crean los talleres base (nombre, descripción, duración) que luego podrá planificar con fechas específicas.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Crear Taller"),
    popover: {
      title: "Nuevo taller base",
      description:
        "Agregue un nuevo taller al inventario maestro. Defina nombre, descripción, duración y otros atributos para que esté disponible al planificar.",
      side: "bottom",
      align: "center",
    },
  },
];

export const bovedaTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Inventario de Bóveda"),
    popover: {
      title: "Inventario de Bóveda",
      description:
        "Catálogo digital del patrimonio artístico del museo. Gestione obras de arte, artistas y todos los datos técnicos asociados a cada pieza.",
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
        "Ingrese una nueva pieza al inventario: código de inventario, título, artista (seleccionable desde el catálogo), técnica, año, medidas, categoría, ubicación e imagen.",
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
        "Cree fichas de artistas para asociarlos a las obras. Busque primero por cédula para evitar registrar duplicados en el catálogo.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="buscador-obras"]') ||
      document.querySelector('input[placeholder="Buscar por código, título o autor..."]'),
    popover: {
      title: "Buscador de obras",
      description:
        "Busque obras por código de inventario, título o autor. Los resultados se filtran en tiempo real.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findTable(),
    popover: {
      title: "Tabla de obras",
      description:
        "Inventario completo con código, título, autor, técnica, categoría, ubicación y estado de cada obra. Haga clic en cualquier fila para ver la ficha completa de la obra.",
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

export const bibliotecaTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Inventario de Biblioteca"),
    popover: {
      title: "Módulo de Biblioteca",
      description:
        "Gestión del inventario bibliográfico del museo. Administre el catálogo de libros, realice préstamos en sala y controle las devoluciones.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () => findButtonContainingText("Registrar Nuevo Libro"),
    popover: {
      title: "Registrar nuevo libro",
      description:
        "Agregue un nuevo título al catálogo: unidad, título, autor, estante, categoría, año, cantidad total y estado.",
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
        "Busque libros por unidad, título o autor dentro del catálogo. Resultados en tiempo real.",
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
        "Tabla del inventario con unidad, título, autor, estante, categoría, cantidad disponible y total, y estado actual del ejemplar.",
      side: "top",
      align: "center",
    },
  },
  {
    element: () => findHeadingByText("Control de Préstamos"),
    popover: {
      title: "Préstamos por cédula",
      description:
        "Busque por cédula del solicitante para ver el historial completo de préstamos: libros activos, devueltos, fechas y estados.",
      side: "top",
      align: "center",
    },
  },
];

export const rrhhTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Gestión de RRHH"),
    popover: {
      title: "Módulo de Recursos Humanos",
      description:
        "Gestión integral del personal del museo y usuarios del sistema. Tres secciones principales: Trabajadores, Usuarios y Asistencias.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Trabajadores") ||
      findButtonContainingText("Trabajadores"),
    popover: {
      title: "Pestaña: Trabajadores",
      description:
        "Registre y administre el personal del museo. Cada trabajador puede tener una foto, cargo, horario semanal y un carnet institucional con código QR para control de asistencia.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Usuarios") || findButtonContainingText("Usuarios"),
    popover: {
      title: "Pestaña: Usuarios del sistema",
      description:
        "Gestione las cuentas de acceso al panel administrativo. Cree usuarios vinculados a trabajadores, asigne roles (Administrador, Recepcionista, Bibliotecario, Curador, Educación) y restablezca contraseñas cuando sea necesario.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      findButtonByText("Asistencias") || findButtonContainingText("Asistencias"),
    popover: {
      title: "Pestaña: Asistencias",
      description:
        "Historial de entradas y salidas del personal. Revise el resumen semanal con horas acumuladas, pendientes y estado de cumplimiento. Puede justificar inasistencias directamente desde aquí.",
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
        "Complete los datos del empleado: nombres, apellidos, cédula, fecha de nacimiento, teléfono, correo, cargo, horario semanal y estado. Una vez registrado, podrá generar su carnet institucional.",
      side: "left",
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
        "Cree una nueva cuenta de acceso vinculando un trabajador existente. Defina el correo electrónico, contraseña inicial y el rol del sistema que determinará los módulos a los que tendrá acceso.",
      side: "left",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('[data-tour="resumen-semanal"]') ||
      findButtonContainingText("Resumen Semanal"),
    popover: {
      title: "Resumen semanal de asistencias",
      description:
        "Panel colapsable con el resumen de horas requeridas, acumuladas, restantes y si cada trabajador cumplió con su jornada. Incluye botón para justificar inasistencias.",
      side: "top",
      align: "center",
    },
  },
];

export const papeleraTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Papelera"),
    popover: {
      title: "Papelera de reciclaje",
      description:
        "Gestión de registros eliminados del sistema. Aquí puede restaurar elementos o eliminarlos definitivamente. Solo accesible para Administradores y Gerentes.",
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
        "Lista de elementos eliminados organizados por tipo (taller, libro, artista u obra), con título, detalles y fecha de eliminación.",
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
        "Elimine el registro de forma permanente. Precaución: esta acción no se puede deshacer desde el panel. Solo debe usarse con autorización explícita.",
      side: "bottom",
      align: "center",
    },
  },
];

export const profileTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Mi Perfil"),
    popover: {
      title: "Perfil de Usuario",
      description:
        "Información de su cuenta personal. Aquí puede ver y actualizar sus datos de perfil incluyendo foto, nombre, correo electrónico y rol asignado en el sistema.",
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
        "Foto de perfil, nombre completo, rol y opción para actualizar su foto o cambiar su contraseña desde el panel de edición.",
      side: "bottom",
      align: "center",
    },
  },
];

export const ingresosTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Registro de Ingresos"),
    popover: {
      title: "Módulo de Ingresos",
      description:
        "Panel de control de visitas al museo y registro horario del personal. Dos vistas principales: Dashboard de Visitantes y Reloj de Trabajadores.",
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
        "Vista resumen con estadísticas de visitas: visitas del día, visitantes únicos, total histórico y métricas de afluencia.",
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
        "Registro de entrada y salida del personal del museo. Permite escanear el código QR del carnet o ingresar la cédula para marcar asistencia.",
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
    element: () => findHeadingByText("Módulo de Educación"),
    popover: {
      title: "Módulo de Educación",
      description:
        "Portal integrado de gestión educativa del museo. Acceso rápido a Talleres y Cursos, y a las Solicitudes de Auditorio desde una sola pantalla.",
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
        "Administración de solicitudes de uso del auditorio para actividades educativas. Calendario de reservas, creación y seguimiento de eventos.",
      side: "bottom",
      align: "center",
    },
  },
];

export const registroPublicoTourSteps: DriveStep[] = [
  {
    element: () => findHeadingByText("Registro de Visitante"),
    popover: {
      title: "Registro Público de Visitantes",
      description:
        "Formulario de auto-registro para visitantes del museo. Complete sus datos personales para registrar su ingreso sin necesidad de pasar por taquilla.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('input[placeholder*="Cédula"]') ||
      document.querySelector('input[name="cedula"]'),
    popover: {
      title: "Verificación de cédula",
      description:
        "Ingrese su número de cédula para verificar si ya está registrado en el sistema. Si ya existe, sus datos se cargarán automáticamente.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('input[placeholder*="Nombre"]') ||
      document.querySelector('input[name="nombres"]'),
    popover: {
      title: "Datos personales",
      description:
        "Complete sus datos: nombres, apellidos, teléfono, fecha de nacimiento y cantidad de acompañantes. Si es una visita institucional, marque la casilla correspondiente.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: () =>
      document.querySelector('select[id*="motivo"]') ||
      document.querySelector('select[name*="motivo"]'),
    popover: {
      title: "Motivo de la visita",
      description:
        "Seleccione el motivo de su visita al museo. Las opciones disponibles incluyen visita general, investigación, eventos culturales y más.",
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
  "/papelera": papeleraTourSteps,
  "/profile": profileTourSteps,
  "/ingresos": ingresosTourSteps,
  "/educacion": educacionTourSteps,
  "/registro-visitante": registroPublicoTourSteps,
};
