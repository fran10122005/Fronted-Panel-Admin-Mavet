import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Obra, RegistroAsistencia, Trabajador } from "../types";
import { axiosInstance } from "./api";

// ─── Premium color palette ──────────────────────────────────────────────────
const C = {
  brand: [128, 0, 0] as [number, number, number],
  brandDark: [92, 0, 0] as [number, number, number],
  brandLight: [163, 61, 61] as [number, number, number],
  gold: [196, 152, 90] as [number, number, number],
  goldLight: [232, 213, 176] as [number, number, number],
  text: [45, 45, 45] as [number, number, number],
  textSoft: [107, 107, 107] as [number, number, number],
  textMuted: [155, 155, 155] as [number, number, number],
  line: [228, 228, 228] as [number, number, number],
  rowEven: [255, 255, 255] as [number, number, number],
  rowOdd: [253, 248, 246] as [number, number, number],
  accent: [245, 237, 232] as [number, number, number],
};

const LOGO_PATH = "/images/logo/mavet2.png";

let logoPromise: Promise<string> | null = null;

function getLogo(): Promise<string> {
  if (!logoPromise) {
    logoPromise = fetch(LOGO_PATH)
      .then((r) => r.blob())
      .then(
        (b) =>
          new Promise<string>((resolve) => {
            const rd = new FileReader();
            rd.onloadend = () => resolve(rd.result as string);
            rd.readAsDataURL(b);
          })
      )
      .catch(() => "");
  }
  return logoPromise;
}

async function addHeader(doc: jsPDF, title: string) {
  const logo = await getLogo();
  const pw = doc.internal.pageSize.getWidth();

  doc.setFillColor(...C.brandDark);
  doc.rect(0, 0, pw, 78, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, 76, pw, 4, "F");

  if (logo) {
    try {
      doc.addImage(logo, "PNG", 18, 10, 48, 48);
    } catch { /* */ }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("MUSEO DE ARTES VISUALES DEL ESTADO TÁCHIRA", 78, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("MAVET – Sistema de Gestión Interna", 78, 34);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 78, 54);
}

function addFooter(doc: jsPDF) {
  const pc = (doc as any).internal.getNumberOfPages();
  const pw = doc.internal.pageSize.getWidth();
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.4);
    doc.line(30, h - 38, pw - 30, h - 38);

    const today = new Date().toLocaleDateString("es-VE", {
      day: "2-digit", month: "long", year: "numeric",
    });

    doc.setFontSize(7);
    doc.setTextColor(...C.textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(today, 30, h - 30);
    doc.text(`Pág. ${i} de ${pc}`, pw / 2, h - 30, { align: "center" });
    doc.text("Documento de uso interno", pw - 30, h - 30, { align: "right" });
  }
}

// ─── PDF: Inventario de Obras ───────────────────────────────────────────────
export async function exportarInventarioObras(_obras: Obra[]) {
  try {
    const res = await axiosInstance.get('/api/reportes/obras', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarInventarioObras]", e);
    alert("Error al generar el reporte. Verifica tu conexión e inicia sesión nuevamente.");
  }
}

// ─── PDF: Reporte de Asistencia ──────────────────────────────────────────────
export async function exportarReporteAsistencia(
  _asistencias: RegistroAsistencia[],
  _periodo?: string
) {
  try {
    const res = await axiosInstance.get('/api/reportes/asistencia', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarReporteAsistencia]", e);
    alert("Error al generar el reporte. Verifica tu conexión e inicia sesión nuevamente.");
  }
}

// ─── PDF: Catálogo de Biblioteca ─────────────────────────────────────────────
export async function exportarCatalogoBiblioteca() {
  try {
    const res = await axiosInstance.get('/api/reportes/biblioteca', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarCatalogoBiblioteca]", e);
    alert("Error al generar el catálogo. Verifica tu conexión e inicia sesión nuevamente.");
  }
}

// ─── PDF: Constancia de Trabajo ──────────────────────────────────────────────
export async function exportarCartaAvalHoras(
  trabajador: Trabajador,
  asistencias: RegistroAsistencia[]
) {
  if (!trabajador.cedula) {
    alert("No se puede generar la constancia: el trabajador no tiene una cédula asignada.");
    return;
  }

  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addHeader(doc, "CARTA DE AVAL");

    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    const fechaHoy = new Date().toLocaleDateString("es-VE", {
      day: "2-digit", month: "long", year: "numeric",
    });

    doc.setTextColor(...C.textSoft);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Emitida el: ${fechaHoy}`, 78, 82);

    // Línea decorativa gold
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.4);
    doc.line(40, 97, pw - 40, 97);

    doc.y = 112;
    doc.setTextColor(...C.text);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Quien suscribe, Director del Museo de Artes Visuales del Estado Táchira (MAVET), hace constar mediante la presente que:",
      { align: "justify" }
    );
    doc.y += 16;

    // Recuadro del trabajador
    const cy = doc.y;
    const boxH = 80;

    doc.setFillColor(...C.line);
    doc.rect(42, cy + 1, pw - 80, boxH, "F");
    doc.setFillColor(...C.accent);
    doc.rect(40, cy, pw - 80, boxH, "F");
    doc.setFillColor(...C.gold);
    doc.rect(40, cy, 4, boxH, "F");

    const cargo = trabajador.cargo || "—";
    const nombre = `${trabajador.nombre} ${trabajador.apellido}`.trim().toUpperCase();

    doc.setTextColor(...C.brand);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(nombre, 56, cy + 14);

    doc.setTextColor(...C.text);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Cédula: ${trabajador.cedula || "—"}    Cargo: ${cargo}`, 56, cy + 34);
    doc.text(
      `Estado: ${trabajador.estado || "Activo"}    Correo: ${trabajador.correo || "—"}    Tel: ${trabajador.telefono || "—"}`,
      56,
      cy + 48,
      { maxWidth: pw - 110 }
    );

    doc.y = cy + boxH + 22;

    doc.setTextColor(...C.text);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Ha cumplido sus horas de servicio en esta institución de manera satisfactoria, de acuerdo con los registros de asistencia que se detallan a continuación:",
      { align: "justify" }
    );
    doc.y += 16;

    // Tabla de asistencias
    const th = ["Fecha", "Entrada Mañana", "Salida Mañana", "Entrada Tarde", "Salida Tarde"];
    const trows = asistencias.length > 0
      ? asistencias.map((a) => {
          const fmt = (dt: string | null | undefined) =>
            dt
              ? new Date(dt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
              : "—";
          return [a.fecha || "—", fmt(a.entradaManana), fmt(a.salidaTarde), fmt(a.entradaTarde), fmt(a.salidaTarde)];
        })
      : [["Sin registros", "", "", "", ""]];

    const cw = (pw - 80) / 5;
    let y = doc.y;

    // Encabezado de tabla
    doc.setFillColor(...C.line);
    doc.rect(42, y + 1, pw - 80, 22, "F");
    doc.setFillColor(...C.brand);
    doc.rect(40, y, pw - 80, 22, "F");
    doc.setFillColor(...C.brandDark);
    doc.rect(40, y + 20, pw - 80, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    th.forEach((h, i) => doc.text(h, 46 + i * cw, y + 6, { maxWidth: cw - 10 }));
    y += 22;

    trows.forEach((row, ri) => {
      if (y > ph - 110) { doc.addPage(); y = 50; }
      const bg = ri % 2 === 0 ? C.rowEven : C.rowOdd;
      doc.setFillColor(...bg);
      doc.rect(40, y, pw - 80, 18, "F");
      doc.setTextColor(...C.text);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      row.forEach((text, i) => doc.text(String(text), 46 + i * cw, y + 5, { maxWidth: cw - 10 }));
      if (ri < trows.length - 1) {
        doc.setDrawColor(...C.line);
        doc.setLineWidth(0.2);
        doc.line(40, y + 18, pw - 40, y + 18);
      }
      y += 18;
    });

    // Borde exterior tabla
    doc.setDrawColor(...C.brandLight);
    doc.setLineWidth(0.4);
    doc.rect(40, y - trows.length * 18, pw - 80, trows.length * 18);

    // Totales
    const totalDias = asistencias.length;
    const totalHoras = asistencias.reduce((s, a) => s + (a.horasCumplidas || 0), 0);
    y = Math.max(y + 5, doc.y + 5);
    doc.setTextColor(...C.brand);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${totalDias} días  ·  ${totalHoras} horas cumplidas`, 40, y);

    // Firma
    y += 30;
    if (y > ph - 130) { doc.addPage(); y = 60; }

    doc.setDrawColor(...C.text);
    doc.setLineWidth(0.5);
    doc.line(40, y, 200, y);
    doc.setTextColor(...C.text);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Director(a) MAVET", 40, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Firma Autorizada", 40, y + 20);

    // Sello
    const sx = pw - 65, sy = y - 8;
    doc.setDrawColor(...C.brand);
    doc.setLineWidth(0.6);
    doc.circle(sx, sy, 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.brand);
    doc.text("MAVET", sx, sy - 3, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.text("MUSEO DE", sx, sy + 4, { align: "center" });
    doc.text("ARTES VISUALES", sx, sy + 9, { align: "center" });
    doc.text("DEL TÁCHIRA", sx, sy + 14, { align: "center" });

    addFooter(doc);
    doc.output('dataurlnewwindow');
  } catch (e) {
    console.error("[exportarCartaAvalHoras]", e);
    alert("Error al generar la constancia de trabajo. Verifique su conexión.");
  }
}

// ─── PDF: Historial de Eventos (Auditorio) ──────────────────────────────────
export async function exportarHistorialEventos(_eventos: any[]) {
  try {
    const res = await axiosInstance.get('/api/reportes/eventos', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarHistorialEventos]", e);
    alert("Error al generar el historial de eventos. Verifica tu conexión e inicia sesión nuevamente.");
  }
}

// ─── PDF: Listado de Trabajadores ──────────────────────────────────────────
export async function exportarReporteTrabajadores() {
  try {
    const res = await axiosInstance.get('/api/reportes/trabajadores', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarReporteTrabajadores]", e);
    alert("Error al generar el listado de trabajadores. Verifica tu conexión e inicia sesión nuevamente.");
  }
}

// ─── PDF: Listado de Usuarios ──────────────────────────────────────────────
export async function exportarReporteUsuarios() {
  try {
    const res = await axiosInstance.get('/api/reportes/usuarios', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarReporteUsuarios]", e);
    alert("Error al generar el listado de usuarios. Verifica tu conexión e inicia sesión nuevamente.");
  }
}

// ─── PDF: QR Público de Auto-Ingreso ─────────────────────────────────────────
export async function exportarQRPublico(qrImageUrl: string, publicUrl: string) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addHeader(doc, "Código QR — Auto Ingreso");

    const pw = doc.internal.pageSize.getWidth();

    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.4);
    doc.line(20, 84, pw - 20, 84);

    const resp = await fetch(qrImageUrl);
    const blob = await resp.blob();
    const qrBase64 = await new Promise<string>((resolve) => {
      const rd = new FileReader();
      rd.onloadend = () => resolve(rd.result as string);
      rd.readAsDataURL(blob);
    });

    const qrSize = 100;
    const xPos = (pw - qrSize) / 2;
    const yPos = 50;

    // Sombra
    doc.setFillColor(...C.line);
    doc.rect(xPos - 6, yPos + 1, qrSize + 12, qrSize + 12, "F");

    // Fondo blanco + borde
    doc.setFillColor(255, 255, 255);
    doc.rect(xPos - 6, yPos - 6, qrSize + 12, qrSize + 12, "F");
    doc.setDrawColor(...C.brand);
    doc.setLineWidth(0.5);
    doc.rect(xPos - 6, yPos - 6, qrSize + 12, qrSize + 12, "S");

    doc.addImage(qrBase64, "PNG", xPos, yPos, qrSize, qrSize);

    doc.setTextColor(...C.textSoft);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("O escanee el código QR o visite:", pw / 2, yPos + qrSize + 20, { align: "center" });

    doc.setTextColor(...C.brand);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(publicUrl, pw / 2, yPos + qrSize + 28, { align: "center" });

    doc.setTextColor(...C.text);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const instructions = [
      "1. Abra la cámara de su teléfono y apunte al código QR.",
      "2. Toque el enlace que aparece en la pantalla.",
      "3. Complete sus datos personales y seleccione el motivo de su visita.",
      "4. ¡Listo! Su ingreso quedará registrado automáticamente.",
    ];
    let iy = yPos + qrSize + 42;
    instructions.forEach((line) => {
      doc.text(line, 28, iy);
      iy += 7;
    });

    addFooter(doc);
    doc.output('dataurlnewwindow');
  } catch (e) {
    console.error("[exportarQRPublico]", e);
    alert("Error al generar el PDF del código QR. Verifique su conexión a internet.");
  }
}
