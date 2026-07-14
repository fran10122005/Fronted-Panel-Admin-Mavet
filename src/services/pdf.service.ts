import { Obra, RegistroAsistencia, Trabajador } from "../types";
import { axiosInstance } from "./api";

// ─── Premium color palette ──────────────────────────────────────────────────
const C = {
  brand: [128, 0, 0] as [number, number, number],
  text: [45, 45, 45] as [number, number, number],
  textMuted: [155, 155, 155] as [number, number, number],
  line: [228, 228, 228] as [number, number, number],
  rowOdd: [253, 248, 246] as [number, number, number],
};

const LOGO_PATH = "/images/logo/mavet2.png";
const MARGIN = 18;

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
          }),
      )
      .catch(() => "");
  }
  return logoPromise;
}

async function addHeader(doc: any, title: string) {
  const logo = await getLogo();
  const pw = doc.internal.pageSize.getWidth();
  let logoW = 0;

  if (logo) {
    try {
      doc.addImage(logo, "PNG", MARGIN, 4, 12, 12);
      logoW = 14;
    } catch {
      /* */
    }
  }

  const tx = MARGIN + logoW;
  const textW = pw - tx - MARGIN;

  doc.setTextColor(...C.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MUSEO DE ARTES VISUALES DEL ESTADO TÁCHIRA", tx, 7, {
    maxWidth: textW,
  });

  doc.setTextColor(...C.brand);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, tx, 16, { maxWidth: textW });

  const barY = 24;
  doc.setDrawColor(...C.brand);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, barY, pw - MARGIN, barY);
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, barY + 1, pw - MARGIN, barY + 1);
}

// ─── PDF: Inventario de Obras ───────────────────────────────────────────────
export async function exportarInventarioObras(obras: Obra[]) {
  try {
    if (!obras.length) return;

    const { jsPDF } = await import("jspdf");
    const { applyPlugin } = await import("jspdf-autotable");
    applyPlugin(jsPDF);

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
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
      head: [
        ["Código", "Título", "Autor", "Año", "Técnica", "Estado", "Ubicación"],
      ],
      body: tableData,
      startY: 32,
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
      margin: { left: MARGIN, right: MARGIN, top: 32 },
      didDrawPage: (data: any) => {
        if (data.pageNumber > 1) {
          const pw2 = doc.internal.pageSize.getWidth();
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("MUSEO DE ARTES VISUALES DEL ESTADO TÁCHIRA", MARGIN, 7);
          doc.setTextColor(...C.brand);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("INVENTARIO DE BÓVEDA – OBRAS DE ARTE", MARGIN, 16);
          doc.setDrawColor(...C.brand);
          doc.setLineWidth(0.8);
          doc.line(MARGIN, 24, pw2 - MARGIN, 24);
          doc.setDrawColor(...C.line);
          doc.setLineWidth(0.2);
          doc.line(MARGIN, 25, pw2 - MARGIN, 25);
        }
      },
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    const today = new Date().toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const ph = doc.internal.pageSize.getHeight();

      doc.setDrawColor(...C.line);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, ph - 14, pw - MARGIN, ph - 14);

      doc.setFontSize(7);
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      doc.text(today, MARGIN, ph - 9);
      doc.text(`Pág. ${i} de ${totalPages}`, pw - MARGIN, ph - 9, {
        align: "right",
      });
    }

    doc.save(
      `MAVET_Inventario_Obras_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  } catch (e) {
    console.error("[exportarInventarioObras]", e);
    alert(
      "Error al generar el reporte. Verifica tu conexión e inicia sesión nuevamente.",
    );
  }
}

// ─── PDF: Reporte de Ingresos ───────────────────────────────────────────────
export async function exportarReporteIngresos(
  ingresos: any[],
  periodo?: string,
) {
  try {
    if (!ingresos.length) {
      alert("No hay ingresos para generar el reporte.");
      return;
    }

    const { jsPDF } = await import("jspdf");
    const { applyPlugin } = await import("jspdf-autotable");
    applyPlugin(jsPDF);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pw = doc.internal.pageSize.getWidth();

    const tituloPeriodo = periodo ? ` (${periodo})` : "";
    await addHeader(doc, `REPORTE DE INGRESOS${tituloPeriodo}`);

    const tableData = ingresos.map((i: any) => {
      const nombre =
        `${i.Persona?.nombres || ""} ${i.Persona?.apellidos || ""}`.trim() ||
        "Desconocido";
      const hora = i.fecha_hora_entrada
        ? new Date(i.fecha_hora_entrada).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
      const fecha = i.fecha_hora_entrada
        ? new Date(i.fecha_hora_entrada).toLocaleDateString("es-ES")
        : "-";
      const motivo = i.Motivo?.descripcion || i.motivo || "-";
      const acomp = i.cantidad_acompanantes || 0;
      return [
        nombre,
        i.Persona?.cedula || "-",
        fecha,
        hora,
        motivo,
        acomp.toString(),
      ];
    });

    (doc as any).autoTable({
      head: [["Nombre", "Cédula", "Fecha", "Hora", "Motivo", "Acompañantes"]],
      body: tableData,
      startY: 32,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [128, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [253, 248, 246],
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 40 },
        5: { cellWidth: 20, halign: "center" },
      },
      margin: { left: MARGIN, right: MARGIN, top: 32 },
      didDrawPage: (data: any) => {
        if (data.pageNumber > 1) {
          const pw2 = doc.internal.pageSize.getWidth();
          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("MUSEO DE ARTES VISUALES DEL ESTADO TÁCHIRA", MARGIN, 7);
          doc.setTextColor(...C.brand);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`REPORTE DE INGRESOS${tituloPeriodo}`, MARGIN, 16);
          doc.setDrawColor(...C.brand);
          doc.setLineWidth(0.8);
          doc.line(MARGIN, 24, pw2 - MARGIN, 24);
          doc.setDrawColor(...C.line);
          doc.setLineWidth(0.2);
          doc.line(MARGIN, 25, pw2 - MARGIN, 25);
        }
      },
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    const today = new Date().toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const ph = doc.internal.pageSize.getHeight();

      doc.setDrawColor(...C.line);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, ph - 14, pw - MARGIN, ph - 14);

      doc.setFontSize(7);
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      doc.text(today, MARGIN, ph - 9);
      doc.text(`Pág. ${i} de ${totalPages}`, pw - MARGIN, ph - 9, {
        align: "right",
      });
    }

    doc.save(`MAVET_Ingresos_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (e) {
    console.error("[exportarReporteIngresos]", e);
    alert("Error al generar el reporte de ingresos.");
  }
}

// ─── PDF: Reporte de Asistencia ──────────────────────────────────────────────
export async function exportarReporteAsistencia(
  params: { rango: "mes" | "custom", fechaInicio?: string, fechaFin?: string }
) {
  try {
    const res = await axiosInstance.get("/api/reportes/asistencia", {
      params,
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarReporteAsistencia]", e);
    alert(
      "Error al generar el reporte. Verifica tu conexión e inicia sesión nuevamente.",
    );
  }
}

// ─── PDF: Catálogo de Biblioteca ─────────────────────────────────────────────
export async function exportarCatalogoBiblioteca() {
  try {
    const res = await axiosInstance.get("/api/reportes/biblioteca", {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarCatalogoBiblioteca]", e);
    alert(
      "Error al generar el catálogo. Verifica tu conexión e inicia sesión nuevamente.",
    );
  }
}

// ─── PDF: Constancia de Trabajo ──────────────────────────────────────────────
export async function exportarCartaAvalHoras(
  trabajador: Trabajador,
  _asistencias: RegistroAsistencia[],
) {
  if (!trabajador.cedula) {
    alert(
      "No se puede generar la constancia: el trabajador no tiene una cédula asignada.",
    );
    return;
  }

  try {
    const res = await axiosInstance.get(
      `/api/reportes/carta-aval/${trabajador.cedula}`,
      { responseType: "blob" },
    );
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
    const res = await axiosInstance.get("/api/reportes/eventos", {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarHistorialEventos]", e);
    alert(
      "Error al generar el historial de eventos. Verifica tu conexión e inicia sesión nuevamente.",
    );
  }
}

// ─── PDF: Listado de Trabajadores ──────────────────────────────────────────
export async function exportarReporteTrabajadores() {
  try {
    const res = await axiosInstance.get("/api/reportes/trabajadores", {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarReporteTrabajadores]", e);
    alert(
      "Error al generar el listado de trabajadores. Verifica tu conexión e inicia sesión nuevamente.",
    );
  }
}

// ─── PDF: Listado de Usuarios ──────────────────────────────────────────────
export async function exportarReporteUsuarios() {
  try {
    const res = await axiosInstance.get("/api/reportes/usuarios", {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarReporteUsuarios]", e);
    alert(
      "Error al generar el listado de usuarios. Verifica tu conexión e inicia sesión nuevamente.",
    );
  }
}

// ─── PDF: QR Público de Auto-Ingreso ─────────────────────────────────────────
export async function exportarQRPublico(
  _qrImageUrl: string,
  publicUrl: string,
) {
  try {
    const res = await axiosInstance.get("/api/reportes/qr", {
      params: { publicUrl },
      responseType: "blob",
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

    const res = await axiosInstance.get(`/api/reportes/carnet/${id}`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarCarnetTrabajador]", e);
    alert("Error al generar la credencial.");
  }
}


