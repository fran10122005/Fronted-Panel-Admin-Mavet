export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
export const NUMERIC_REGEX = /^[0-9]*$/;

export function validateRequired(value: any, fieldName: string): string | null {
  if (value === undefined || value === null) return `${fieldName} es obligatorio.`;
  if (typeof value === "string" && value.trim() === "") return `${fieldName} es obligatorio.`;
  if (typeof value === "number" && (isNaN(value) || value <= 0)) return `${fieldName} debe ser un número válido.`;
  return null;
}

export function validateEmail(value: string, fieldName: string): string | null {
  if (!value || value.trim() === "") return null;
  if (!EMAIL_REGEX.test(value)) return `${fieldName} debe tener un formato válido (ej. usuario@dominio.com).`;
  return null;
}

export function validatePhone(value: string, fieldName: string): string | null {
  if (!value || value.trim() === "") return null;
  if (!PHONE_REGEX.test(value)) return `${fieldName} debe contener solo números (7-20 dígitos).`;
  return null;
}

export function limitNumericInput(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "Tab" ||
    e.key === "Escape" ||
    e.key === "Enter" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "Home" ||
    e.key === "End" ||
    e.ctrlKey ||
    e.metaKey
  ) return;
  if (!NUMERIC_REGEX.test(e.key)) e.preventDefault();
}


