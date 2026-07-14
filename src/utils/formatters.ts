export function formatHoras(h: number): string {
  const totalMinutos = Math.floor(h * 60);
  const hrs = Math.floor(totalMinutos / 60);
  const min = totalMinutos % 60;
  if (hrs === 0) return `${min} min`;
  if (min === 0) return `${hrs}h`;
  return `${hrs}h ${min}min`;
}

export function formatCedula(cedula: string): string {
  if (!cedula) return "";
  
  // Si tiene el prefijo V- o E-
  let prefix = "";
  let digits = cedula;
  
  if (cedula.toUpperCase().startsWith("V-") || cedula.toUpperCase().startsWith("E-")) {
    prefix = cedula.substring(0, 2).toUpperCase();
    digits = cedula.substring(2);
  } else if (cedula.toUpperCase().startsWith("V") || cedula.toUpperCase().startsWith("E")) {
    prefix = cedula.substring(0, 1).toUpperCase() + "-";
    digits = cedula.substring(1);
  }
  
  // Limpiar no digitos
  digits = digits.replace(/\D/g, "");
  
  // Aplicar formato de puntos
  const formattedDigits = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return prefix ? `${prefix}${formattedDigits}` : formattedDigits;
}
