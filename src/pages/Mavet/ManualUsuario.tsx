import { useState } from "react";
import {
  GridIcon,
  ListIcon,
  FileIcon,
  PageIcon,
  CalenderIcon,
  TableIcon,
  FolderIcon,
  GroupIcon,
  TrashBinIcon,
  UserCircleIcon,
  EyeIcon,
  DownloadIcon,
} from "../../icons";
import manualPdfUrl from "../../../Manual_MAVET_Guia_Visual_Estilo_Instructivo_CORREGIDO.pdf?url";

type Seccion = {
  id: string;
  titulo: string;
  icon: React.ReactNode;
  roles: string[];
  contenido: { subtitulo: string; pasos: string[] }[];
};

const secciones: Seccion[] = [
  {
    id: "dashboard",
    titulo: "Dashboard / Inicio",
    icon: <GridIcon />,
    roles: ["Todos"],
    contenido: [
      {
        subtitulo: "Vista general",
        pasos: [
          "Al iniciar sesión, la página principal muestra un resumen del museo.",
          "Las tarjetas (KPIs) muestran: visitas hoy, visitantes únicos, total histórico, eventos del día.",
          "Los gráficos y tablas varían según tu rol (Administrador ve todo, Recepcionista ve solo visitas).",
        ],
      },
    ],
  },
  {
    id: "recepcion",
    titulo: "Recepci\u00f3n",
    icon: <ListIcon />,
    roles: ["Administrador", "Gerente", "Recepcionista"],
    contenido: [
      {
        subtitulo: "Registrar ingreso de visitante",
        pasos: [
          "Busca a la persona por cédula, nombre o teléfono en el Buscador Global.",
          "Si aparece, haz clic para autocompletar el formulario.",
          "Si no aparece, llena los datos manualmente: cédula, nombres, apellidos, fecha de nacimiento, teléfono.",
          "Selecciona el Motivo de la visita del menú desplegable.",
          "Si hoy hay eventos o talleres, aparecerán en «Eventos y Talleres de Hoy» al final del select.",
          "Marca «Es Visita Institucional / Grupal» si aplica y especifica la cantidad de acompañantes.",
          "Haz clic en «Registrar Ingreso».",
          "El sistema crea o actualiza la persona y registra la entrada con fecha y hora.",
        ],
      },
      {
        subtitulo: "Registrar menor acompañante",
        pasos: [
          "Selecciona primero al adulto responsable en el buscador.",
          "Haz clic en «Registrar Menor» (aparece solo cuando hay un adulto seleccionado).",
          "Llena los datos del menor: nombres, apellidos, fecha de nacimiento.",
          "Si el menor tiene 9+ años, su cédula es obligatoria. Si es menor de 9, es opcional.",
          "Los menores de 12 años pueden registrarse como acompañantes; de 12+ deben ser visitantes regulares.",
          "También puedes usar los botones de «Ingreso Rápido» si el adulto tiene menores previamente asociados.",
        ],
      },
      {
        subtitulo: "Ingresar menor desde el modal rápido",
        pasos: [
          "Cuando seleccionas una persona que tiene menores asociados, aparecen botones azules.",
          "Haz clic en «Ingresar a [nombre]» para registrar su entrada sin formulario.",
        ],
      },
      {
        subtitulo: "Agenda de Hoy (panel lateral)",
        pasos: [
          "El panel derecho muestra los eventos y talleres programados para hoy.",
          "Haz clic en el icono de actualizar para refrescar la agenda.",
          "Selecciona un evento de la agenda en el formulario para vincular el ingreso a ese evento.",
        ],
      },
      {
        subtitulo: "Ingresos de Hoy (tabla inferior)",
        pasos: [
          "Debajo del formulario se listan todos los ingresos registrados hoy.",
          "Muestra nombre, cédula, hora de entrada y motivo.",
          "Si hay más de 5, usa «Ver más» para expandir.",
        ],
      },
      {
        subtitulo: "Generar QR de Auto-Ingreso",
        pasos: [
          "Haz clic en «Generar QR Público» en la esquina superior derecha.",
          "Se abre un modal con el código QR y la URL pública.",
          "Puedes imprimirlo para colocarlo en la entrada del museo.",
          "Los visitantes escanean el QR y se registran ellos mismos.",
        ],
      },
      {
        subtitulo: "Asistencia Personal (empleados)",
        pasos: [
          "Haz clic en «Asistencia Personal» para abrir el modal de marcaje.",
          "Escanea el código QR del empleado o ingresa su cédula manualmente.",
          "El sistema detecta automáticamente si debe marcar entrada o salida.",
        ],
      },
    ],
  },
  {
    id: "ingresos",
    titulo: "Ingresos (Historial)",
    icon: <FileIcon />,
    roles: ["Administrador", "Gerente", "Recepcionista"],
    contenido: [
      {
        subtitulo: "Consultar historial de ingresos",
        pasos: [
          "La página Ingresos muestra todos los registros de entrada al museo.",
          "Puedes filtrar por fecha usando el selector de fecha.",
          "Los resultados son paginados y ordenados del más reciente al más antiguo.",
          "Cada registro muestra: nombre del visitante, cédula, hora de entrada, motivo y acompañantes.",
        ],
      },
    ],
  },
  {
    id: "talleres",
    titulo: "Talleres",
    icon: <PageIcon />,
    roles: ["Administrador", "Gerente", "Educaci\u00f3n"],
    contenido: [
      {
        subtitulo: "Crear taller en inventario",
        pasos: [
          "Haz clic en «Crear Taller» en la esquina superior derecha.",
          "Ingresa el nombre y la descripción del tipo de taller.",
          "Esto crea una plantilla en el inventario para usarla después.",
        ],
      },
      {
        subtitulo: "Planificar un taller (programar edición)",
        pasos: [
          "Selecciona un taller del inventario y haz clic en «Planificar Taller».",
          "Completa el formulario: selecciona taller del inventario, instructor (obligatorio), espacio/sala, número de sesiones.",
          "Ingresa la fecha del taller (obligatorio), hora de inicio y fin.",
          "Define cupo mínimo y máximo de participantes.",
          "Haz clic en «Guardar».",
          "El taller planificado aparecerá en la agenda pública y en la recepción.",
        ],
      },
      {
        subtitulo: "Inscribir alumnos",
        pasos: [
          "En la lista de talleres planificados, haz clic en «Inscribir» junto al taller deseado.",
          "Busca al alumno por cédula. Si ya existe, se autocompletan los datos.",
          "Si es menor de edad (menos de 18 años), debes asociar un representante.",
          "Si el representante no existe, créalo primero desde el módulo de Alumnos.",
          "Completa la inscripción y el alumno quedará registrado como «Inscrito».",
        ],
      },
      {
        subtitulo: "Gestionar sesiones",
        pasos: [
          "En la lista de talleres, haz clic en «Sesiones» para ver las sesiones del taller.",
          "Crea nuevas sesiones con fecha, hora de inicio, hora fin y tema.",
          "Las sesiones se usan para registrar la asistencia de los alumnos.",
        ],
      },
      {
        subtitulo: "Pasar lista / registrar asistencia",
        pasos: [
          "Dentro del modal de sesiones, haz clic en «Asistencia» de la sesión deseada.",
          "Verás la lista de alumnos inscritos con un checkbox.",
          "Marca los alumnos que asistieron y haz clic en «Guardar Asistencia».",
          "También se muestran los ingresos registrados en recepción para ese taller.",
        ],
      },
      {
        subtitulo: "Ver métricas del taller",
        pasos: [
          "Haz clic en «Métricas» para ver estadísticas de asistencia.",
          "Muestra: total de inscritos, promedio de asistencia, sesiones realizadas, etc.",
        ],
      },
    ],
  },
  {
    id: "auditorio",
    titulo: "Auditorio y Espacios",
    icon: <CalenderIcon />,
    roles: ["Administrador", "Gerente", "Educaci\u00f3n"],
    contenido: [
      {
        subtitulo: "Nueva reserva del auditorio",
        pasos: [
          "En el calendario, haz clic sobre una fecha o en «Nueva Reserva».",
          "Se genera automáticamente un código de reserva.",
          "Ingresa el título/motivo, tipo de evento (Conferencia, Exposición, Taller, Reunión u Otro).",
          "Selecciona fecha, hora de inicio y hora de fin.",
          "Busca al organizador por cédula (debe existir en la base de datos de personas).",
          "Si la persona no existe, debes registrarla primero en Recepción.",
          "Haz clic en «Guardar Reserva».",
        ],
      },
      {
        subtitulo: "Editar o eliminar reserva",
        pasos: [
          "Haz clic sobre el evento en el calendario o en el botón de lápiz en la vista de lista.",
          "Modifica los campos necesarios y haz clic en «Actualizar Reserva».",
          "Para eliminar, haz clic en «Eliminar» dentro del modal de edición.",
        ],
      },
      {
        subtitulo: "Ver asistentes de un evento",
        pasos: [
          "En la vista de lista, cada evento tiene un botón «Ver Asistentes (Check-In)».",
          "Muestra todas las personas que registraron su ingreso en recepción seleccionando ese evento.",
        ],
      },
      {
        subtitulo: "Filtrar y exportar",
        pasos: [
          "Usa el campo de búsqueda y el filtro por tipo de evento.",
          "Cambia entre vista de calendario y vista de lista.",
          "Haz clic en «Exportar PDF» para descargar el historial de eventos.",
        ],
      },
      {
        subtitulo: "Gestionar espacios (Salas)",
        pasos: [
          "Debajo del calendario está la sección «Salas» para gestionar los espacios del museo.",
          "Puedes crear, editar y eliminar espacios, con nombre, capacidad y código.",
        ],
      },
    ],
  },
  {
    id: "inventario-obras",
    titulo: "Inventario de B\u00f3veda",
    icon: <TableIcon />,
    roles: ["Administrador", "Gerente", "Curador"],
    contenido: [
      {
        subtitulo: "Registrar una obra",
        pasos: [
          "Haz clic en «Nueva Obra».",
          "Llena los datos: código de inventario, título, artista (búscalo o créalo), técnica, estado, categoría.",
          "Ingresa medidas, año, tipo de ingreso, número de piezas, peso, descripción.",
          "Selecciona la ubicación física.",
          "Puedes subir una imagen de la obra.",
          "Haz clic en «Guardar».",
        ],
      },
      {
        subtitulo: "Buscar y filtrar obras",
        pasos: [
          "Usa el campo de búsqueda para encontrar por título, artista o código.",
          "Filtra por estado de la obra (Excelente, Bueno, Restauración, etc.).",
        ],
      },
      {
        subtitulo: "Exportar inventario",
        pasos: [
          "Haz clic en el botón de exportar (icono rojo de descarga) para generar un PDF.",
        ],
      },
      {
        subtitulo: "Gestionar catálogos",
        pasos: [
          "Usa los botones de «Artistas», «Técnicas», «Estados» y «Categorías» para administrar estos catálogos.",
          "Puedes crear, editar y eliminar registros en cada catálogo.",
        ],
      },
    ],
  },
  {
    id: "biblioteca",
    titulo: "Biblioteca",
    icon: <FolderIcon />,
    roles: ["Administrador", "Gerente", "Bibliotecario"],
    contenido: [
      {
        subtitulo: "Registrar un libro",
        pasos: [
          "Haz clic en «Nuevo Libro».",
          "Ingresa: título, unidad, cuota, autor(es), estante, categoría, año.",
          "Define cantidad total y cantidad disponible.",
          "Selecciona el estado (Disponible o No Disponible).",
          "Haz clic en «Guardar».",
        ],
      },
      {
        subtitulo: "Prestar libro (consulta en sala)",
        pasos: [
          "En la lista de libros, haz clic en «Prestar».",
          "Se abre un modal donde buscas al visitante por cédula y registras el préstamo.",
          "El sistema reduce la cantidad disponible automáticamente.",
        ],
      },
      {
        subtitulo: "Devolver libro",
        pasos: [
          "En la lista de libros, haz clic en «Devolver».",
          "Confirma la devolución y el sistema incrementa la cantidad disponible.",
        ],
      },
      {
        subtitulo: "Buscar y exportar",
        pasos: [
          "Usa el campo de búsqueda para encontrar libros por título o autor.",
          "Haz clic en exportar PDF para descargar el catálogo.",
        ],
      },
    ],
  },
  {
    id: "rrhh",
    titulo: "Recursos Humanos",
    icon: <GroupIcon />,
    roles: ["Administrador", "Gerente"],
    contenido: [
      {
        subtitulo: "Gestionar trabajadores (pesta\u00f1a Trabajadores)",
        pasos: [
          "Lista todos los empleados con búsqueda y paginación.",
          "Haz clic en «Nuevo Trabajador» para registrar uno nuevo.",
          "Llena: nombres, apellidos, cédula, teléfono, dirección, fecha de nacimiento, cargo, turnos.",
          "Define las horas semanales y el estado (Activo/Inactivo).",
          "Puedes subir una foto del trabajador.",
          "Edita o elimina (soft-delete) desde los botones de acción.",
        ],
      },
      {
        subtitulo: "Registrar asistencia (pesta\u00f1a Asistencias)",
        pasos: [
          "Desde Recepción, usa «Asistencia Personal» para marcar entrada/salida.",
          "Escanea el QR del trabajador o ingresa su cédula.",
          "El sistema muestra el estado actual y la próxima marcación esperada.",
          "Muestra las horas transcurridas para jornadas activas.",
        ],
      },
      {
        subtitulo: "Generar reportes de RRHH",
        pasos: [
          "Exportar listado de trabajadores en PDF.",
          "Exportar consolidado de asistencia en PDF.",
          "Generar carnet individual con foto y datos del trabajador.",
          "Generar credenciales masivas (todos los trabajadores activos).",
          "Generar carta aval por cédula del trabajador.",
        ],
      },
      {
        subtitulo: "Gestionar usuarios del sistema (pesta\u00f1a Usuarios)",
        pasos: [
          "Lista todos los usuarios del sistema con su rol y trabajador asociado.",
          "Crea nuevos usuarios con correo, contraseña y rol.",
          "Puedes reiniciar la contraseña de un usuario.",
          "Exportar listado de usuarios en PDF.",
        ],
      },
      {
        subtitulo: "Gestionar cargos y turnos",
        pasos: [
          "Usa los botones «Cargos» y «Turnos» para administrar estos catálogos.",
          "Crea, edita o elimina cargos y turnos según las necesidades.",
        ],
      },
    ],
  },
  {
    id: "papelera",
    titulo: "Papelera",
    icon: <TrashBinIcon />,
    roles: ["Administrador", "Gerente"],
    contenido: [
      {
        subtitulo: "Restaurar o eliminar permanentemente",
        pasos: [
          "La papelera muestra todos los registros eliminados (soft-delete), agrupados por tipo.",
          "Cada grupo muestra: tipo de registro, nombre/título, detalle y fecha de eliminación.",
          "Usa «Restaurar» para recuperar un registro eliminado.",
          "Usa «Eliminar Permanentemente» para borrar definitivamente.",
          "Las acciones destructivas requieren confirmación.",
        ],
      },
    ],
  },
  {
    id: "perfil",
    titulo: "Mi Perfil",
    icon: <UserCircleIcon />,
    roles: ["Todos"],
    contenido: [
      {
        subtitulo: "Editar perfil personal",
        pasos: [
          "Desde el menú lateral, ve a «Mi Perfil».",
          "Puedes actualizar tu foto de perfil.",
          "Puedes cambiar tu correo electrónico y contraseña.",
        ],
      },
    ],
  },
  {
    id: "qr-publico",
    titulo: "Registro P\u00fablico (QR)",
    icon: <EyeIcon />,
    roles: ["Visitante"],
    contenido: [
      {
        subtitulo: "Auto-registro desde el QR",
        pasos: [
          "Escanea el código QR en la entrada del museo.",
          "Se abre una página web donde ingresas tu número de cédula.",
          "Si ya has visitado antes, el sistema te saluda por tu nombre.",
          "Si es tu primera vez, completa: nombres, apellidos, teléfono y fecha de nacimiento.",
          "Selecciona el motivo de tu visita (evento, taller, consulta, etc.).",
          "Si estás inscrito en un taller, aparecerá automáticamente como opción.",
          "Haz clic en «Registrar mi Entrada».",
          "¡Listo! Ya puedes ingresar al museo.",
        ],
      },
    ],
  },
];

// ─── PDF Export ───────────────────────────────────────────────────────────────
async function exportarManualPDF() {
  const link = document.createElement("a");
  link.href = manualPdfUrl;
  link.download = "MAVET_Inventario_Obras_2026-07-07 (1).pdf";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ManualUsuario() {
  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
  const [subseccionAbierta, setSubseccionAbierta] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const filtradas = secciones.filter((s) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      s.titulo.toLowerCase().includes(q) ||
      s.contenido.some(
        (c) =>
          c.subtitulo.toLowerCase().includes(q) ||
          c.pasos.some((p) => p.toLowerCase().includes(q))
      )
    );
  });

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportarManualPDF();
    } catch (e) {
      console.error("[exportPDF]", e);
      alert("Error al generar el PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manual de Usuario
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Guía completa del Sistema MAVET
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          <DownloadIcon />
          {exporting ? "Generando PDF…" : "Exportar PDF"}
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en el manual..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm transition"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Índice lateral */}
        <aside className="lg:w-64 shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-3">
              Módulos
            </p>
            {filtradas.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSeccionActiva(seccionActiva === s.id ? null : s.id);
                  const el = document.getElementById(`sec-${s.id}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  seccionActiva === s.id
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                  {s.icon}
                </span>
                {s.titulo}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-10">
          {filtradas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 dark:text-gray-500 text-lg">
                No se encontraron resultados para &ldquo;{busqueda}&rdquo;.
              </p>
            </div>
          )}

          {filtradas.map((seccion) => (
            <section
              key={seccion.id}
              id={`sec-${seccion.id}`}
              className="scroll-mt-24"
            >
              {/* Encabezado de sección */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 [&>svg]:w-5 [&>svg]:h-5">
                  {seccion.icon}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {seccion.titulo}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {seccion.roles.map((r) => (
                      <span
                        key={r}
                        className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          r === "Todos" || r === "Visitante"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subsecciones */}
              <div className="space-y-4">
                {seccion.contenido.map((sub) => {
                  const key = `${seccion.id}-${sub.subtitulo}`;
                  const abierta = subseccionAbierta === key;
                  return (
                    <div
                      key={key}
                      className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
                    >
                      <button
                        onClick={() =>
                          setSubseccionAbierta(abierta ? null : key)
                        }
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {sub.subtitulo}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            abierta ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {abierta && (
                        <div className="px-4 pb-5 pt-0 border-t border-gray-100 dark:border-gray-700/50">
                          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            {sub.pasos.map((paso, i) => (
                              <li key={i} className="leading-relaxed">
                                {paso}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Footer */}
          <div className="pt-8 pb-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              MAVET — Museo de Artes Visuales y Espacios del Táchira
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
              Versión 1.0 — Manual de Usuario
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
