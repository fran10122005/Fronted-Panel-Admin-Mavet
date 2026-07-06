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
  // Page background: gradient + corner accents
  addGradientOverlay(doc);
  addCornerAccents(doc);

  const logo = await getLogo();
  const pw = doc.internal.pageSize.getWidth();

  doc.setFillColor(...C.brandDark);
  doc.rect(0, 0, pw, 32, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, 30, pw, 2, "F");

  if (logo) {
    try {
      doc.addImage(logo, "PNG", 10, 3, 26, 26);
    } catch { /* */ }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MUSEO DE ARTES VISUALES DEL ESTADO TÁCHIRA", 42, 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("MAVET – Sistema de Gestión Interna", 42, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, 42, 24);
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
  _asistencias: RegistroAsistencia[]
) {
  if (!trabajador.cedula) {
    alert("No se puede generar la constancia: el trabajador no tiene una cédula asignada.");
    return;
  }

  try {
    const res = await axiosInstance.get(`/api/reportes/carta-aval/${trabajador.cedula}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
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
export async function exportarQRPublico(_qrImageUrl: string, publicUrl: string) {
  try {
    const res = await axiosInstance.get('/api/reportes/qr', { 
      params: { publicUrl },
      responseType: 'blob' 
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarQRPublico]", e);
    alert("Error al generar el PDF del código QR. Verifique su conexión.");
  }
}

// ─── Helper: load image as base64 data URL ───────────────────────────────────
async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── PDF: Credencial de Trabajador (Carnet tipo ID Card) ─────────────────────
export async function exportarCarnetTrabajador(trabajador: Trabajador) {
  try {
    const { jsPDF } = await import("jspdf");

    // Card dimensions in mm (ISO ID-1 style: 88 × 56 mm)
    const cardW = 88;
    const cardH = 56;
    const pageW = cardW + 20;
    const pageH = cardH + 20;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [pageH, pageW] });

    const originX = (pageW - cardW) / 2;
    const originY = (pageH - cardH) / 2;
    const sideW = cardW * 0.35;

    // ── 1. Card background ──
    doc.setFillColor(253, 248, 246);
    doc.roundedRect(originX, originY, cardW, cardH, 4, 4, "F");

    // ── 2. Left sidebar (maroon) ──
    doc.setFillColor(128, 0, 0);
    doc.roundedRect(originX, originY, sideW, cardH, 4, 4, "F");
    // Fill right edge of sidebar to keep it flat
    doc.rect(originX + sideW - 4, originY, 4, cardH, "F");

    // ── 3. Logo MAVET ──
    const logo = await getLogo();
    if (logo) {
      try {
        const logoSize = sideW * 0.30;
        doc.addImage(logo, "PNG", originX + (sideW - logoSize) / 2, originY + 3, logoSize, logoSize);
      } catch { /* ignore */ }
    }

    // ── 4. Photo (circular via clip or fallback initials) ──
    const photoCenterX = originX + sideW / 2;
    const photoSize = sideW * 0.50;
    const photoY = originY + cardH / 2 - photoSize / 2 - 3;

    // Gold border circle
    doc.setFillColor(196, 152, 90);
    doc.circle(photoCenterX, photoY + photoSize / 2, photoSize / 2 + 1.5, "F");
    // Light grey circle background
    doc.setFillColor(240, 240, 240);
    doc.circle(photoCenterX, photoY + photoSize / 2, photoSize / 2, "F");

    // Try to load and draw photo
    let photoDrawn = false;
    if (trabajador.foto_url && trabajador.foto_url.startsWith("http")) {
      const photoData = await loadImageAsDataUrl(trabajador.foto_url);
      if (photoData) {
        try {
          // Draw photo as square clipped visually inside the circle area
          doc.addImage(photoData, "JPEG",
            photoCenterX - photoSize / 2, photoY,
            photoSize, photoSize
          );
          photoDrawn = true;
        } catch { /* ignore */ }
      }
    }

    if (!photoDrawn) {
      // Draw initials
      const initials = `${(trabajador.nombre || "").charAt(0)}${(trabajador.apellido || "").charAt(0)}`.toUpperCase();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(photoSize * 1.1);
      doc.setTextColor(255, 255, 255);
      doc.text(initials || "?", photoCenterX, photoY + photoSize / 2 + 2, { align: "center" });
    }

    // ── 5. "MAVET" text at bottom of sidebar ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(232, 213, 176);
    doc.text("MAVET", photoCenterX, originY + cardH - 3, { align: "center" });

    // ── 6. Right side — Worker data ──
    const textX = originX + sideW + 4;
    const rightW = cardW - sideW - 7;
    let y = originY + 7;

    // Name
    const nombreCompleto = `${trabajador.nombre || ""} ${trabajador.apellido || ""}`.trim();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(cardW * 0.065);
    doc.setTextColor(128, 0, 0);
    doc.text(nombreCompleto, textX, y, { maxWidth: rightW });

    y += 5;

    // Cargo
    const cargoStr = (trabajador.cargo || "TRABAJADOR").toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(cardW * 0.048);
    doc.setTextColor(196, 152, 90);
    doc.text(cargoStr, textX, y, { maxWidth: rightW });

    y += 4.5;

    // Separator line
    doc.setDrawColor(232, 213, 176);
    doc.setLineWidth(0.3);
    doc.line(textX, y, originX + cardW - 3, y);

    y += 3.5;

    // Fields
    const fields = [
      { label: "Cédula", value: trabajador.cedula || "—" },
      { label: "Teléfono", value: trabajador.telefono || "—" },
      { label: "Correo", value: trabajador.correo || "—" },
    ];

    doc.setFontSize(cardW * 0.038);
    for (const f of fields) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(140, 140, 140);
      const labelW = doc.getTextWidth(`${f.label}: `);
      doc.text(`${f.label}: `, textX, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(45, 45, 45);
      doc.text(f.value, textX + labelW, y, { maxWidth: rightW - labelW });
      y += 3.8;
    }

    // ── 7. QR Code ──
    const qrData = `MAVET|${trabajador.cedula || ""}|${nombreCompleto}|${cargoStr}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    const qrDataUrl = await loadImageAsDataUrl(qrUrl);
    const qrSize = cardW * 0.12;
    const qrX = originX + cardW - qrSize - 3;
    const qrY = originY + cardH - qrSize - 3;

    if (qrDataUrl) {
      try {
        // Gold border around QR
        doc.setDrawColor(196, 152, 90);
        doc.setLineWidth(0.3);
        doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 0.8, 0.8, "S");
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      } catch { /* ignore */ }
    }

    // ── 8. Dates ──
    const today = new Date();
    const fechaStr = today.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(cardW * 0.034);
    doc.setTextColor(140, 140, 140);
    doc.text(`Emitido: ${fechaStr}`, textX, originY + cardH - 6);
    doc.text("Válido: mientras dure la relación laboral", textX, originY + cardH - 3);

    // ── 9. Outer gold border ──
    doc.setDrawColor(196, 152, 90);
    doc.setLineWidth(0.4);
    doc.roundedRect(originX, originY, cardW, cardH, 4, 4, "S");

    // ── Open PDF ──
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarCarnetTrabajador]", e);
    alert("Error al generar la credencial.");
  }
}

// ─── PDF: Credenciales Masivas (múltiples trabajadores) ──────────────────────
export async function exportarCredencialesMasivas(_trabajadores: Trabajador[]) {
  try {
    const res = await axiosInstance.get('/api/reportes/credenciales-masivas', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarCredencialesMasivas]", e);
    alert("Error al generar las credenciales masivas. Verifique su conexión.");
  }
}
