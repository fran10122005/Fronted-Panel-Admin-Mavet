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

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_RULES = {
  minLength: PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
} as const;

export type PasswordStrength = "none" | "weak" | "medium" | "strong" | "very-strong";

export function getPasswordStrength(password: string): { level: PasswordStrength; score: number; label: string } {
  if (!password) return { level: "none", score: 0, label: "" };

  let score = 0;

  if (password.length >= PASSWORD_MIN_LENGTH) score += 25;
  else if (password.length >= 6) score += 10;

  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  if (score >= 100) return { level: "very-strong", score: 100, label: "Muy fuerte" };
  if (score >= 80) return { level: "strong", score, label: "Fuerte" };
  if (score >= 60) return { level: "medium", score, label: "Media" };
  return { level: "weak", score, label: "Débil" };
}

export function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];
  if (!password) return errors;
  if (password.length < PASSWORD_MIN_LENGTH) errors.push(`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`);
  if (!/[a-z]/.test(password)) errors.push("Al menos una minúscula");
  if (!/[A-Z]/.test(password)) errors.push("Al menos una mayúscula");
  if (!/[0-9]/.test(password)) errors.push("Al menos un número");
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push("Al menos un carácter especial");
  return errors;
}


