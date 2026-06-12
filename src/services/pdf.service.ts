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
export async function exportarInventarioObras(obras: Obra[]) {
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
  asistencias: RegistroAsistencia[],
  periodo?: string
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

// ─── PDF: Carta de Aval de Horas (Trabajador individual) ─────────────────────
export async function exportarCartaAvalHoras(
  trabajador: Trabajador,
  asistencias: RegistroAsistencia[]
) {
  if (!trabajador.cedula) {
    alert("No se puede generar la carta: el trabajador no tiene una cédula asignada.");
    return;
  }
  try {
    const res = await axiosInstance.get(`/api/reportes/carta-aval/${trabajador.cedula}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarCartaAvalHoras]", e);
    alert("Error al generar la carta de aval. Verifica tu conexión e inicia sesión nuevamente.");
  }
}

// ─── PDF: Historial de Eventos (Auditorio) ──────────────────────────────────
export async function exportarHistorialEventos(eventos: any[]) {
  try {
    const res = await axiosInstance.get('/api/reportes/eventos', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (e) {
    console.error("[exportarHistorialEventos]", e);
    alert("Error al generar el historial de eventos. Verifica tu conexión e inicia sesión nuevamente.");
  }
}
