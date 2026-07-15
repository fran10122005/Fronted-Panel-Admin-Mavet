import { PASSWORD_MIN_LENGTH } from "../../utils/validation";

interface Props {
  password: string;
}

function check(label: string, ok: boolean) {
  return (
    <li className="flex items-center gap-1.5 text-xs">
      <span className={ok ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}>
        {ok ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        )}
      </span>
      <span className={ok ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400"}>{label}</span>
    </li>
  );
}

export default function PasswordRules({ password }: Props) {
  return (
    <ul className="mt-2 space-y-1">
      {check(`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`, password.length >= PASSWORD_MIN_LENGTH)}
      {check("Al menos una letra mayúscula", /[A-Z]/.test(password))}
      {check("Al menos una letra minúscula", /[a-z]/.test(password))}
      {check("Al menos un número", /[0-9]/.test(password))}
      {check("Al menos un carácter especial (@, #, $, etc.)", /[^a-zA-Z0-9]/.test(password))}
    </ul>
  );
}
