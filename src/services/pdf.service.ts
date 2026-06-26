import jsPDF from "jspdf";
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
const MARGIN = 18;

// ─── Helper: apply opacity via GState ─────────────────────────────────────────
const G = (doc: jsPDF) => (doc as any).GState as any;
function setOpacity(doc: jsPDF, opacity: number) {
  (doc as any).setGState(new (G(doc))({ opacity }));
}

// ─── Decorative: page gradient background ─────────────────────────────────────
// Mimics `aside-gradient` from login: linear-gradient(180deg, rgba(128,0,0,0.15)→transparent)
function addGradientOverlay(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const steps = 20;
  const stepH = ph / steps;
  const peakAlpha = 0.16;
  for (let i = 0; i < steps; i++) {
    const alpha = peakAlpha * (1 - i / steps);
    doc.setFillColor(...C.brand);
    setOpacity(doc, alpha);
    doc.rect(0, i * stepH, pw, stepH + 1, "F");
  }
  setOpacity(doc, 1);
}

// ─── Decorative: grid pattern ────────────────────────────────────────────────
// Mimics grid-01.svg: subtle grid lines + small rectangles at intersections
function addDecorativeGrid(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20;

  doc.setDrawColor(178, 178, 178);
  doc.setLineWidth(0.1);
  setOpacity(doc, 0.12);

  const hCount = 5;
  const vCount = 6;
  const hStep = (ph - m * 2) / hCount;
  const vStep = (pw - m * 2) / vCount;

  for (let i = 0; i <= hCount; i++) {
    const y = m + i * hStep;
    doc.line(m, y, pw - m, y);
  }
  for (let i = 0; i <= vCount; i++) {
    const x = m + i * vStep;
    doc.line(x, m, x, ph - m);
  }

  setOpacity(doc, 0.05);
  doc.setFillColor(178, 178, 178);
  const dotSize = 4;
  const pattern: [number, number][] = [
    [m + vStep * 0, m + hStep * 0], [m + vStep * 2, m + hStep * 1],
    [m + vStep * 4, m + hStep * 2], [m + vStep * 1, m + hStep * 3],
    [m + vStep * 3, m + hStep * 4], [m + vStep * 5, m + hStep * 0],
    [m + vStep * 0, m + hStep * 2], [m + vStep * 3, m + hStep * 5],
  ];
  pattern.forEach(([x, y]) => {
    doc.rect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize, "F");
  });

  setOpacity(doc, 1);
}

// ─── Decorative: corner accents ──────────────────────────────────────────────
function addCornerAccents(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const s = 10;

  setOpacity(doc, 0.35);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.4);

  // Bottom-left corner flourish
  doc.line(MARGIN, ph - MARGIN, MARGIN, ph - MARGIN - s);
  doc.line(MARGIN, ph - MARGIN, MARGIN + s, ph - MARGIN);
  // Bottom-right corner flourish
  doc.line(pw - MARGIN, ph - MARGIN, pw - MARGIN, ph - MARGIN - s);
  doc.line(pw - MARGIN, ph - MARGIN, pw - MARGIN - s, ph - MARGIN);

  setOpacity(doc, 1);
}

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
  // Page background: gradient + grid + corner accents
  addGradientOverlay(doc);
  addDecorativeGrid(doc);
  addCornerAccents(doc);

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

    // Background decorations for pages after the first
    if (i > 1) {
      addGradientOverlay(doc);
      addDecorativeGrid(doc);
      addCornerAccents(doc);
    }

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

// ─── PDF: Credencial de Trabajador (Carnet tipo ID Card) ─────────────────────

// Paleta de colores institucional MAVET para credenciales
const CRED = {
  // Granates institucionales (del login bg-brand-950)
  maroonDark: [36, 0, 0] as [number, number, number],      // #240000 — brand-950
  maroon: [128, 0, 0] as [number, number, number],          // #800000 — brand-500
  maroonMid: [112, 0, 0] as [number, number, number],       // #700000 — brand-600
  maroonLight: [163, 61, 61] as [number, number, number],   // #a33d3d — brand-400
  maroonSoft: [191, 107, 107] as [number, number, number],  // #bf6b6b — brand-300

  // Dorados (acentos de la UI actual)
  gold: [196, 152, 90] as [number, number, number],
  goldLight: [232, 213, 176] as [number, number, number],

  // Neutros
  white: [255, 255, 255] as [number, number, number],
  offWhite: [253, 248, 246] as [number, number, number],
  textDark: [45, 45, 45] as [number, number, number],
  textMuted: [140, 140, 140] as [number, number, number],
  line: [228, 228, 228] as [number, number, number],
};

/**
 * Dibuja un carnet individual en una posición dada del documento.
 * Diseño horizontal moderno tipo ID card (inspirado en plataformas
 * digitales de carnetización): foto a la izquierda, datos a la derecha,
 * QR en esquina inferior derecha, barra de color en la parte inferior.
 */
async function dibujarCarnet(
  doc: jsPDF,
  trabajador: Trabajador,
  originX: number,
  originY: number,
  cardW: number,
  cardH: number
) {
  // ── 1. Fondo blanco con sombra sutil ────────────────────────────────
  doc.setFillColor(...CRED.offWhite);
  doc.roundedRect(originX, originY, cardW, cardH, 4, 4, "F");

  // ── 2. Barra lateral izquierda (franja de color institucional) ──────
  const sideW = cardW * 0.35;
  doc.setFillColor(...CRED.maroon);
  doc.roundedRect(originX, originY, sideW, cardH, 4, 4, "F");
  // Cubrir el borde redondeado derecho de la barra (queda recto contra el contenido)
  doc.rect(originX + sideW - 4, originY, 4, cardH, "F");

  // ── 3. Logo MAVET en la esquina superior izquierda ──────────────────
  const logo = await getLogo();
  if (logo) {
    try {
      const logoSize = sideW * 0.30;
      doc.addImage(logo, "PNG", originX + (sideW - logoSize) / 2, originY + 3, logoSize, logoSize);
    } catch { /* */ }
  }

  // ── 4. Foto circular centrada en la barra izquierda ─────────────────
  const photoCenterX = originX + sideW / 2;
  const photoSize = sideW * 0.60;
  const photoY = originY + cardH / 2 - photoSize / 2 - 4;

  doc.setFillColor(...CRED.gold);
  doc.circle(photoCenterX, photoY + photoSize / 2, photoSize / 2 + 1.5, "F");
  doc.setFillColor(240, 240, 240);
  doc.circle(photoCenterX, photoY + photoSize / 2, photoSize / 2, "F");

  let fotoCargada = false;
  if (trabajador.foto_url) {
    try {
      const resp = await fetch(trabajador.foto_url);
      if (resp.ok) {
        const blob = await resp.blob();
        const b64 = await new Promise<string>((resolve) => {
          const rd = new FileReader();
          rd.onloadend = () => resolve(rd.result as string);
          rd.readAsDataURL(blob);
        });
        doc.saveGraphicsState();
        doc.circle(photoCenterX, photoY + photoSize / 2, photoSize / 2, "s");
        doc.clip();
        doc.addImage(b64, "PNG", photoCenterX - photoSize / 2, photoY, photoSize, photoSize);
        doc.restoreGraphicsState();
        fotoCargada = true;
      }
    } catch { /* */ }
  }
  if (!fotoCargada) {
    const iniciales = `${trabajador.nombre?.charAt(0) || ""}${trabajador.apellido?.charAt(0) || ""}`.toUpperCase();
    doc.setTextColor(...CRED.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(photoSize * 0.40);
    doc.text(iniciales || "?", photoCenterX, photoY + photoSize / 2 + photoSize * 0.15, { align: "center" });
  }

  // ── 5. Sección derecha: datos del trabajador ────────────────────────
  const leftEdge = originX + sideW + 3;
  const rightW = cardW - sideW - 6;
  const textX = leftEdge + 1;
  let y = originY + 7;

  // ── 5a. Nombre completo (más prominente) ────────────────────────────
  const nombreCompleto = `${trabajador.nombre || ""} ${trabajador.apellido || ""}`.trim();
  doc.setTextColor(...CRED.maroon);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(cardW * 0.065);
  doc.text(nombreCompleto, textX, y, { maxWidth: rightW });
  y += 4.5;

  // ── 5b. Cargo ───────────────────────────────────────────────────────
  doc.setTextColor(...CRED.gold);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(cardW * 0.048);
  doc.text((trabajador.cargo || "TRABAJADOR").toUpperCase(), textX, y, { maxWidth: rightW });
  y += 5;

  // ── 5c. Línea separadora sutil ──────────────────────────────────────
  doc.setDrawColor(...CRED.goldLight);
  doc.setLineWidth(0.3);
  doc.line(textX, y, originX + cardW - 3, y);
  y += 3.5;

  // ── 5d. Campos de datos ─────────────────────────────────────────────
  const fields = [
    { label: "Cédula", value: trabajador.cedula || "—" },
    { label: "Teléfono", value: trabajador.telefono || "—" },
    { label: "Correo", value: trabajador.correo || "—" },
  ];

  doc.setFontSize(cardW * 0.038);
  fields.forEach((f) => {
    doc.setTextColor(...CRED.textMuted);
    doc.setFont("helvetica", "bold");
    doc.text(`${f.label}:`, textX, y);
    const labelW = doc.getTextWidth(`${f.label}:`);
    doc.setTextColor(...CRED.textDark);
    doc.setFont("helvetica", "normal");
    doc.text(f.value, textX + labelW + 1, y, { maxWidth: rightW - labelW - 1 });
    y += 3.8;
  });

  // ── 6. QR + fechas en la parte inferior derecha ─────────────────────
  const qrData = `MAVET|${trabajador.cedula || ""}|${nombreCompleto}|${trabajador.cargo || ""}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
  const qrSize = cardW * 0.12;
  const qrX = originX + cardW - qrSize - 3;
  const qrY = originY + cardH - qrSize - 3;

  let qrBase64 = "";
  try {
    const resp = await fetch(qrUrl);
    if (resp.ok) {
      const blob = await resp.blob();
      qrBase64 = await new Promise<string>((resolve) => {
        const rd = new FileReader();
        rd.onloadend = () => resolve(rd.result as string);
        rd.readAsDataURL(blob);
      });
    }
  } catch { /* */ }

  if (qrBase64) {
    doc.setDrawColor(...CRED.gold);
    doc.setLineWidth(0.3);
    doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 2, 2, "S");
    doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
  }

  // ── 7. Fechas al lado izquierdo del QR ──────────────────────────────
  const today = new Date();
  const fechaStr = today.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
  doc.setTextColor(...CRED.textMuted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(cardW * 0.036);
  const fechasX = textX;
  const fechasY = originY + cardH - 4;
  doc.text(`Emitido: ${fechaStr}`, fechasX, fechasY - 3);
  doc.text("Válido: mientras dure la relación laboral", fechasX, fechasY);

  // ── 8. Borde exterior del carnet ────────────────────────────────────
  doc.setDrawColor(...CRED.gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(originX, originY, cardW, cardH, 4, 4, "S");
}

export async function exportarCarnetTrabajador(trabajador: Trabajador) {
  try {
    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    const cardW = 88;
    const cardH = 56;
    const originX = (pw - cardW) / 2;
    const originY = (ph - cardH) / 2;

    await dibujarCarnet(doc, trabajador, originX, originY, cardW, cardH);

    doc.output("dataurlnewwindow");
  } catch (e) {
    console.error("[exportarCarnetTrabajador]", e);
    alert("Error al generar la credencial. Verifique su conexión.");
  }
}

// ─── PDF: Credenciales Masivas (múltiples trabajadores) ──────────────────────
export async function exportarCredencialesMasivas(trabajadores: Trabajador[]) {
  try {
    if (trabajadores.length === 0) {
      alert("No hay trabajadores para generar credenciales.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Layout: 2 columnas × 2 filas = 4 carnets por página
    const cardW = 75;
    const cardH = 120;
    const gapX = (pw - cardW * 2) / 3;  // margen entre columnas
    const gapY = (ph - cardH * 2) / 3;  // margen entre filas
    const positions = [
      { x: gapX, y: gapY },                          // Superior izquierda
      { x: gapX * 2 + cardW, y: gapY },              // Superior derecha
      { x: gapX, y: gapY * 2 + cardH },              // Inferior izquierda
      { x: gapX * 2 + cardW, y: gapY * 2 + cardH },  // Inferior derecha
    ];

    for (let i = 0; i < trabajadores.length; i++) {
      const posIndex = i % 4;

      if (i > 0 && posIndex === 0) {
        doc.addPage();
      }

      if (posIndex === 0) {
        // Fondo de página
        doc.setFillColor(250, 248, 246);
        doc.rect(0, 0, pw, ph, "F");

        // Líneas de corte centrales (punteadas)
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.15);
        doc.setLineDashPattern([3, 3], 0);
        // Línea horizontal central
        doc.line(10, ph / 2, pw - 10, ph / 2);
        // Línea vertical central
        doc.line(pw / 2, 10, pw / 2, ph - 10);
        doc.setLineDashPattern([], 0);
      }

      const pos = positions[posIndex];
      await dibujarCarnet(doc, trabajadores[i], pos.x, pos.y, cardW, cardH);
    }

    doc.output("dataurlnewwindow");
  } catch (e) {
    console.error("[exportarCredencialesMasivas]", e);
    alert("Error al generar las credenciales masivas. Verifique su conexión.");
  }
}
