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
export async function exportarInventarioObras(obras: Obra[]) {
  try {
    if (!obras.length) return;

    const { jsPDF } = await import("jspdf");
    const { applyPlugin } = await import("jspdf-autotable");
    applyPlugin(jsPDF);

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();

    await addHeader(doc, "INVENTARIO DE BÓVEDA – OBRAS DE ARTE");

    const tableData = obras.map((o) => [
      o.codigo_inventario || o.id?.toString() || "—",
      o.titulo || "—",
      o.autor || "—",
      o.ano?.toString() || "—",
      o.tecnica || "—",
      o.estado || "—",
      o.ubicacion || "—",
    ]);

    (doc as any).autoTable({
      head: [["Código", "Título", "Autor", "Año", "Técnica", "Estado", "Ubicación"]],
      body: tableData,
      startY: 44,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [128, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      alternateRowStyles: {
        fillColor: [253, 248, 246],
      },
      columnStyles: {
        0: { cellWidth: 24, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 42 },
        3: { cellWidth: 14, halign: "center" },
        4: { cellWidth: 34 },
        5: { cellWidth: 24, halign: "center" },
        6: { cellWidth: 34 },
      },
      margin: { left: 18, right: 18 },
      didDrawPage: (data: any) => {
        if (data.pageNumber > 1) {
          addGradientOverlay(doc);
          addCornerAccents(doc);
          doc.setFillColor(...C.brandDark);
          doc.rect(0, 0, pw, 22, "F");
          doc.setFillColor(...C.gold);
          doc.rect(0, 20, pw, 2, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("INVENTARIO DE BÓVEDA – OBRAS DE ARTE", 18, 13);
        }
      },
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    const today = new Date().toLocaleDateString("es-VE", {
      day: "2-digit", month: "long", year: "numeric",
    });

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const ph = doc.internal.pageSize.getHeight();

      doc.setDrawColor(...C.gold);
      doc.setLineWidth(0.4);
      doc.line(30, ph - 14, pw - 30, ph - 14);

      doc.setFontSize(6.5);
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      doc.text(today, 30, ph - 8);
      doc.text(`Pág. ${i} de ${totalPages}`, pw / 2, ph - 8, { align: "center" });
      doc.text("Documento de uso interno", pw - 30, ph - 8, { align: "right" });
    }

    doc.save(`MAVET_Inventario_Obras_${new Date().toISOString().split('T')[0]}.pdf`);
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

// ─── PDF: Credencial de Trabajador (Carnet tipo ID Card) ─────────────────────
export async function exportarCarnetTrabajador(trabajador: Trabajador) {
  try {
    const id = trabajador.id || trabajador.cedula;
    if (!id) throw new Error("No se encontró ID o Cédula");
    
    const res = await axiosInstance.get(`/api/reportes/carnet/${id}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
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
