import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Obra, RegistroAsistencia, Trabajador } from "../types";
import { axiosInstance } from "./api";

const MAVET_COLOR: [number, number, number] = [128, 0, 0]; // #800000 brand-500
const ACCENT_COLOR: [number, number, number] = [163, 61, 61]; // #A33D3D brand-400

function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  // Fondo de encabezado
  doc.setFillColor(...MAVET_COLOR);
  doc.rect(0, 0, 210, 28, "F");

  // Logo / nombre institucional
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("MUSEO DE ARTES VISUALES DEL ESTADO TÁCHIRA", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("MAVET – Sistema Administrativo Interno", 14, 17);

  // Título del reporte
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 24);

  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, 14, 30);
  }

  // Línea separadora
  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(0.5);
  doc.line(0, 29, 210, 29);

  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const today = new Date().toLocaleDateString("es-VE", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(`Generado el ${today} · Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: "center" });
    doc.text("MAVET – Documento de uso interno. No reproducir sin autorización.", pageWidth / 2, 294, { align: "center" });
  }
}

// ─── PDF: Inventario de Obras ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _asistencias: RegistroAsistencia[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    alert("Error al generar el reporte. Verifica tu conexión e inicia sesión nuevamente.");
  }
}

// ─── PDF: Constancia de Trabajo (Trabajador individual) ──────────────────────
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

    addHeader(doc, "Constancia de Trabajo");

    // ── Fecha de emisión ──
    const hoy = new Date().toLocaleDateString("es-VE", {
      day: "2-digit", month: "long", year: "numeric",
    });

    // ── Cuerpo ──
    const marginLeft = 25;
    let y = 42;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Fecha de emisión: ${hoy}`, marginLeft, y);
    y += 14;

    // Texto introductorio
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    const introText = "Por medio de la presente, se hace constar que el/la ciudadano/a:";
    doc.text(introText, marginLeft, y);
    y += 10;

    // Datos del trabajador
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...MAVET_COLOR);
    const nombreCompleto = `${trabajador.nombre} ${trabajador.apellido}`;
    doc.text(nombreCompleto, marginLeft, y);
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Cédula de Identidad: ${trabajador.cedula}`, marginLeft, y);
    y += 8;
    doc.text(`Cargo: ${trabajador.cargo || "No especificado"}`, marginLeft, y);
    y += 8;

    if (trabajador.telefono) {
      doc.text(`Teléfono: ${trabajador.telefono}`, marginLeft, y);
      y += 8;
    }

    if (trabajador.correo) {
      doc.text(`Correo: ${trabajador.correo}`, marginLeft, y);
      y += 8;
    }

    y += 6;

    // Estado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const estadoTexto = trabajador.estado === "Activo" ? "TRABAJADOR ACTIVO" : "TRABAJADOR INACTIVO";
    doc.setFillColor(trabajador.estado === "Activo" ? 220 : 255, trabajador.estado === "Activo" ? 240 : 220, trabajador.estado === "Activo" ? 220 : 220);
    doc.rect(marginLeft, y - 4, 80, 8, "F");
    doc.setTextColor(trabajador.estado === "Activo" ? 0 : 150, trabajador.estado === "Activo" ? 100 : 50, 0);
    doc.text(estadoTexto, marginLeft + 4, y + 1);
    y += 14;

    // ── Resumen de Asistencia ──
    if (asistencias.length > 0) {
      const asistenciasTrabajador = asistencias.filter(
        (a) => a.cedula === trabajador.cedula
      );

      if (asistenciasTrabajador.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...MAVET_COLOR);
        doc.text("Resumen de Asistencia", marginLeft, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        const totalHoras = asistenciasTrabajador.reduce(
          (sum, a) => sum + (a.horasCumplidas || 0), 0
        );
        const totalDias = asistenciasTrabajador.length;

        doc.text(`Total de días registrados: ${totalDias}`, marginLeft, y);
        y += 7;
        doc.text(`Total de horas cumplidas: ${totalHoras} horas`, marginLeft, y);
        y += 7;

        // Tabla de últimas asistencias
        const ultimas = asistenciasTrabajador.slice(-10).reverse();
        if (ultimas.length > 0) {
          y += 4;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          doc.text("Últimos registros:", marginLeft, y);
          y += 5;

          const headers = [["Fecha", "Entrada", "Salida", "Horas"]];
          const data = ultimas.map((a) => [
            a.fecha,
            a.entradaManana || "-",
            a.salidaTarde || "-",
            a.horasCumplidas !== null ? `${a.horasCumplidas}h` : "-",
          ]);

          autoTable(doc, {
            startY: y,
            head: headers,
            body: data,
            theme: "grid",
            headStyles: {
              fillColor: MAVET_COLOR,
              fontSize: 8,
              textColor: 255,
            },
            bodyStyles: { fontSize: 8 },
            margin: { left: marginLeft, right: 25 },
          });
        }
      }
    }

    // ── Cierre ──
    const finalY = (doc as any).lastAutoTable?.finalY || y + 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      "Esta constancia se expide a solicitud del interesado para los fines que estime convenientes.",
      marginLeft,
      finalY + 20
    );

    // ── Firma ──
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const firmaY = finalY + 45;
    doc.line(marginLeft, firmaY, marginLeft + 60, firmaY);
    doc.text("Director(a) MAVET", marginLeft + 5, firmaY + 6);

    // ── Sello ──
    doc.setDrawColor(...MAVET_COLOR);
    doc.setLineWidth(0.8);
    doc.circle(170, firmaY - 5, 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...MAVET_COLOR);
    doc.text("MAVET", 170, firmaY - 3, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("MUSEO DE ARTES", 170, firmaY + 2, { align: "center" });
    doc.text("VISUALES DEL TÁCHIRA", 170, firmaY + 7, { align: "center" });

    addFooter(doc);
    doc.output('dataurlnewwindow');
  } catch (e) {
    console.error("[exportarCartaAvalHoras]", e);
    alert("Error al generar la constancia de trabajo. Verifique su conexión.");
  }
}

// ─── PDF: Historial de Eventos (Auditorio) ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // ── Cargar imagen QR como base64 ──
    const resp = await fetch(qrImageUrl);
    const blob = await resp.blob();
    const qrBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    // ── Header ──
    addHeader(doc, "Código QR — Auto Ingreso", "Escáneelo para registrar su visita al museo");

    // ── QR Code (centrado, 110 mm) ──
    const qrSize = 110;
    const xPos = (210 - qrSize) / 2;
    const yPos = 42;
    doc.addImage(qrBase64, 'PNG', xPos, yPos, qrSize, qrSize);

    // ── URL debajo del QR ──
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("O escanee el código QR o visite:", 105, yPos + qrSize + 16, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...MAVET_COLOR);
    doc.text(publicUrl, 105, yPos + qrSize + 24, { align: "center" });

    // ── Instrucciones ──
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const instructions = [
      "1. Abra la cámara de su teléfono y apunte al código QR.",
      "2. Toque el enlace que aparece en la pantalla.",
      "3. Complete sus datos personales y seleccione el motivo de su visita.",
      "4. ¡Listo! Su ingreso quedará registrado automáticamente.",
    ];
    let y = yPos + qrSize + 38;
    instructions.forEach((line) => {
      doc.text(line, 25, y);
      y += 7;
    });

    // ── Footer ──
    addFooter(doc);

    // ── Abrir para imprimir ──
    doc.output('dataurlnewwindow');
  } catch (e) {
    console.error("[exportarQRPublico]", e);
    alert("Error al generar el PDF del código QR. Verifique su conexión a internet.");
  }
}
