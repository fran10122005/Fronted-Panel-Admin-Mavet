import { getPasswordStrength } from "../../utils/validation";

interface Props {
  password: string;
}

const colors: Record<string, string> = {
  weak: "bg-red-500",
  medium: "bg-yellow-500",
  strong: "bg-green-500",
  "very-strong": "bg-emerald-600",
};

const barWidth: Record<string, string> = {
  weak: "w-1/4",
  medium: "w-2/4",
  strong: "w-3/4",
  "very-strong": "w-full",
};

export default function PasswordStrengthMeter({ password }: Props) {
  const { level, label } = getPasswordStrength(password);

  if (level === "none") return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colors[level]} ${barWidth[level]}`}
          />
        </div>
        <span className={`text-xs font-medium ${
          level === "weak" ? "text-red-600" :
          level === "medium" ? "text-yellow-600" :
          level === "strong" ? "text-green-600" :
          "text-emerald-600"
        }`}>
          {label}
        </span>
      </div>
    </div>
  );
}
