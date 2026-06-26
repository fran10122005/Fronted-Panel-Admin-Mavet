import React from 'react';
import { pdf } from '@react-pdf/renderer';
import CarnetTrabajadorPDF from '../components/pdf/CarnetTrabajadorPDF';
import { Trabajador } from '../types';
import toast from 'react-hot-toast';

export const exportarCarnetReactPDF = async (trabajador: Trabajador) => {
  const loadingToast = toast.loading('Generando carnet premium...');
  try {
    const doc = <CarnetTrabajadorPDF trabajador={trabajador} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const nombreStr = (trabajador.Persona?.nombres || 'Trabajador').replace(/\s+/g, '_');
    link.download = `Carnet_MAVET_${nombreStr}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Carnet generado exitosamente', { id: loadingToast });
  } catch (err) {
    console.error('Error generando PDF con React-PDF:', err);
    toast.error('Error al generar el carnet', { id: loadingToast });
  }
};
