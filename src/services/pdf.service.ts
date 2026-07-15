import { Obra, RegistroAsistencia, Trabajador, EventoAuditorio } from "../types";
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

// ─── PDF: Comprobante de Reserva de Auditorio ────────────────────────────────
export async function exportarComprobanteReserva(ev: EventoAuditorio) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();

    await addHeader(doc, "COMPROBANTE DE RESERVA DE ESPACIO");

    const bodyColor = [248, 245, 242] as [number, number, number];

    // Fecha de emisión
    const now = new Date();
    doc.setTextColor(...C.textMuted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const emitStr = `Emitido: ${now.toLocaleDateString("es-VE", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })}`;
    doc.text(emitStr, MARGIN, 30);

    // Línea decorativa delgada
    doc.setDrawColor(...C.brand);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, 32.5, pw - MARGIN, 32.5);

    // ── DATOS DE LA RESERVA (tabla vertical limpia) ──
    const rows: { label: string; value: string }[] = [
      { label: "N° de Expediente", value: ev.extendedProps?.numero_expediente || ev.numero_expediente || "—" },
      { label: "Código de Reserva", value: ev.codigo_reserva || "—" },
      { label: "Motivo / Evento", value: ev.title || "—" },
      { label: "Tipo de Evento", value: ev.extendedProps?.tipoEvento || "—" },
      { label: "Organizador", value: ev.extendedProps?.organizador || "—" },
      { label: "Cédula", value: ev.extendedProps?.cedula || "—" },
      { label: "Fecha del Evento", value: ev.start?.split("T")[0] || "—" },
      {
        label: "Horario",
        value: `${(ev.start?.split("T")[1]?.substring(0, 5) || "")} - ${(ev.end?.split("T")[1]?.substring(0, 5) || "")}`,
      },
    ];

    let y = 40;
    const colLabel = MARGIN + 2;
    const colVal = 60;
    const rowH = 6.2;

    doc.setDrawColor(225, 220, 215);
    doc.setLineWidth(0.1);

    rows.forEach((r, i) => {
      // Fondo alternado
      if (i % 2 === 0) {
        doc.setFillColor(...bodyColor);
        doc.rect(MARGIN, y - 4.5, pw - MARGIN * 2, rowH, "F");
      }
      // Label
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(r.label, colLabel, y);
      // Value
      doc.setTextColor(...C.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(r.value, colVal, y);
      y += rowH;
    });

    // ── ESTATUS DE APROBACIÓN ──
    y += 3;
    doc.setDrawColor(...C.brand);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, pw - MARGIN, y);
    y += 6;

    doc.setTextColor(...C.textMuted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ESTATUS DE APROBACIÓN", MARGIN, y);
    y += 5;

    const estatus = ev.extendedProps?.estatus_aprobacion || "pendiente";
    const estatusColor = estatus === "aprobado" ? [22, 163, 74] as [number, number, number]
      : estatus === "rechazado" ? [220, 38, 38] as [number, number, number]
      : [200, 140, 0] as [number, number, number];
    const estatusBg = estatus === "aprobado" ? [230, 250, 235] as [number, number, number]
      : estatus === "rechazado" ? [255, 235, 235] as [number, number, number]
      : [255, 248, 225] as [number, number, number];
    const estatusText = estatus === "aprobado" ? "APROBADO"
      : estatus === "rechazado" ? "RECHAZADO"
      : "PENDIENTE DE APROBACIÓN";

    // Caja de estatus
    const boxW = 70;
    const boxH = 8;
    doc.setFillColor(...estatusBg);
    doc.setDrawColor(...estatusColor);
    doc.rect(MARGIN, y - 5, boxW, boxH, "FD");
    doc.setTextColor(...estatusColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(estatusText, MARGIN + 4, y + 0.5);
    y += 8;

    if (estatus === "aprobado" && ev.extendedProps?.aprobado_por_nombre) {
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(`Aprobado por: ${ev.extendedProps.aprobado_por_nombre}`, MARGIN, y);
      y += 5;
    }

    if (estatus === "rechazado" && ev.extendedProps?.motivo_rechazo) {
      doc.setTextColor(...C.textMuted);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("Motivo del rechazo:", MARGIN, y);
      y += 4.5;
      doc.setTextColor(...[180, 40, 40] as [number, number, number]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const lines = doc.splitTextToSize(ev.extendedProps.motivo_rechazo, pw - MARGIN * 2 - 10);
      doc.text(lines, MARGIN + 2, y);
      y += lines.length * 4.5 + 2;
    }

    // ── SELLO DE RECIBIDO ──
    y = Math.max(y, 210);
    doc.setDrawColor(...C.brand);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, pw - MARGIN, y);
    y += 5;

    // Cuadro de sello
    doc.setDrawColor(...C.brand);
    doc.setLineWidth(0.3);
    doc.rect(pw / 2 - 35, y - 3, 70, 18);
    doc.setTextColor(...C.brand);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("SELLO DE RECIBIDO", pw / 2, y + 2, { align: "center" });
    doc.setTextColor(...C.textMuted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("Museo de Artes Visuales y del Espacio del Táchira", pw / 2, y + 7, { align: "center" });
    doc.text("Dirección: Calle 8 entre Carreras 6 y 7, Edif. MAVET", pw / 2, y + 10, { align: "center" });
    doc.text("San Cristóbal, Estado Táchira", pw / 2, y + 13, { align: "center" });

    // Pie de página
    y += 24;
    doc.setDrawColor(...C.brand);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y, pw - MARGIN, y);
    y += 2.5;
    doc.setTextColor(...C.textMuted);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(5.5);
    doc.text(
      "Documento de constancia digital — Este comprobante acredita la recepción de la solicitud de reserva de espacio en el MAVET.",
      MARGIN, y, { maxWidth: pw - MARGIN * 2 }
    );

    doc.save(`comprobante-${ev.codigo_reserva || ev.id || "reserva"}.pdf`);
  } catch (e) {
    console.error("[exportarComprobanteReserva]", e);
    alert("Error al generar el comprobante.");
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


